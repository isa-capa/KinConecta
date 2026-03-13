$ErrorActionPreference = "Stop"

function Singular([string]$w) {
    if ($w -match "ies$") { return $w.Substring(0, $w.Length - 3) + "y" }
    if ($w -match "s$" -and $w -notmatch "ss$") { return $w.Substring(0, $w.Length - 1) }
    return $w
}

function Pascal([string]$s, [bool]$singularLast = $false) {
    $parts = $s -split "_"
    if ($singularLast -and $parts.Length -gt 0) {
        $parts[$parts.Length - 1] = Singular $parts[$parts.Length - 1]
    }
    return (($parts | ForEach-Object {
                if ($_.Length -eq 0) { return $_ }
                $_.Substring(0, 1).ToUpper() + $_.Substring(1)
            }) -join "")
}

function Camel([string]$s) {
    $parts = $s -split "_"
    if ($parts.Length -eq 0) { return $s }
    $first = $parts[0].ToLower()
    if ($parts.Length -eq 1) { return $first }
    $rest = ($parts[1..($parts.Length - 1)] | ForEach-Object {
            if ($_.Length -eq 0) { return $_ }
            $_.Substring(0, 1).ToUpper() + $_.Substring(1)
        }) -join ""
    return $first + $rest
}

function EnumConst([string]$value) {
    $normalized = $value.Normalize([Text.NormalizationForm]::FormD)
    $sb = New-Object Text.StringBuilder
    foreach ($ch in $normalized.ToCharArray()) {
        $uc = [Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch)
        if ($uc -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
            [void]$sb.Append($ch)
        }
    }
    $text = $sb.ToString().Normalize([Text.NormalizationForm]::FormC).ToUpperInvariant()
    $text = [regex]::Replace($text, "[^A-Z0-9]+", "_").Trim("_")
    if ([string]::IsNullOrWhiteSpace($text)) { $text = "UNKNOWN" }
    if ($text -match "^[0-9]") { $text = "_" + $text }
    return $text
}

function JavaType([string]$sqlType) {
    $t = $sqlType.ToUpperInvariant()
    if ($t.StartsWith("ENUM(")) { return "__ENUM__" }
    if ($t.StartsWith("BIGINT")) { return "Long" }
    if ($t.StartsWith("INT")) { return "Integer" }
    if ($t.StartsWith("SMALLINT")) { return "Integer" }
    if ($t -eq "TINYINT(1)") { return "Boolean" }
    if ($t.StartsWith("TINYINT")) { return "Integer" }
    if ($t.StartsWith("DECIMAL")) { return "BigDecimal" }
    if ($t -eq "DATETIME") { return "LocalDateTime" }
    if ($t -eq "DATE") { return "LocalDate" }
    return "String"
}

function Module([string]$table) {
    $map = @{
        "users"                       = "users"
        "languages"                   = "users"
        "auth_sessions"               = "users"

        "tourist_profiles"            = "profileTourist"
        "tourist_profile_languages"   = "profileTourist"
        "interests"                   = "profileTourist"
        "tourist_profile_interests"   = "profileTourist"

        "guide_profiles"              = "profileGuide"
        "guide_profile_languages"     = "profileGuide"
        "guide_expertise_areas"       = "profileGuide"
        "guide_profile_expertise"     = "profileGuide"
        "guide_locations"             = "profileGuide"
        "guide_certifications"        = "profileGuide"
        "guide_adaptations"           = "profileGuide"
        "guide_calendar_events"       = "profileGuide"
        "income_transactions"         = "profileGuide"
        "withdrawal_requests"         = "profileGuide"

        "tour_categories"             = "tours"
        "destinations"                = "tours"
        "tours"                       = "tours"
        "tour_included_items"         = "tours"
        "tour_destinations"           = "tours"
        "trip_bookings"               = "tours"
        "trip_status_history"         = "tours"

        "reviews"                     = "reviews"
        "review_replies"              = "reviews"

        "chat_threads"                = "messenger"
        "chat_messages"               = "messenger"

        "notifications"               = "notifications"

        "support_tickets"             = "help"
        "support_ticket_attachments"  = "help"

        "faq_categories"              = "faq"
        "faq_items"                   = "faq"

        "compatibility_profiles"      = "matching"
        "compatibility_answers"       = "matching"
        "favorite_guides"             = "matching"
        "favorite_tours"              = "matching"

        "contact_messages"            = "contact"
        "newsletter_subscriptions"    = "contact"
    }
    if ($map.ContainsKey($table)) { return $map[$table] }
    return "users"
}

function EnsureDir([string]$path) {
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path | Out-Null
    }
}

function WriteText([string]$path, [string]$content) {
    EnsureDir (Split-Path -Parent $path)
    [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
}

function IdTypeFor([object]$meta) {
    if ($meta.Composite) { return "$($meta.Entity)Id" }
    $pkCol = $meta.Cols | Where-Object { $_.IsPk } | Select-Object -First 1
    return $pkCol.JavaType
}

function JoinImports([string[]]$imports) {
    return (($imports | Sort-Object -Unique | ForEach-Object { "import $_;" }) -join "`n")
}

$root = (Get-Location).Path
$base = Join-Path $root "src/main/java/org/generation/socialNetwork"

$sql = (Invoke-WebRequest -UseBasicParsing "https://raw.githubusercontent.com/isa-capa/KinConecta/main/kinConnect.sql").Content
WriteText (Join-Path $root "kinConnect.sql") $sql

$tableMatches = [regex]::Matches(
    $sql,
    'CREATE TABLE IF NOT EXISTS `kin_conecta`\.`(?<table>[^`]+)` \((?<body>.*?)\)\s*ENGINE\s*=\s*InnoDB',
    [Text.RegularExpressions.RegexOptions]::Singleline
)

$schema = @{}
foreach ($match in $tableMatches) {
    $table = $match.Groups["table"].Value
    $body = $match.Groups["body"].Value
    $cols = @()

    $colMatches = [regex]::Matches(
        $body,
        '^\s*`(?<name>[^`]+)`\s+(?<type>[A-Z]+(?:\([^\)]*\))?(?:\s+UNSIGNED)?)\s*(?<rest>[^\r\n]*),?',
        [Text.RegularExpressions.RegexOptions]::Multiline
    )

    foreach ($cm in $colMatches) {
        $name = $cm.Groups["name"].Value
        $sqlType = $cm.Groups["type"].Value.Trim()
        $rest = $cm.Groups["rest"].Value.Trim()
        $nullable = -not ($rest -match "\bNOT NULL\b")
        $auto = $rest -match "AUTO_INCREMENT"
        $javaType = JavaType $sqlType

        $enumName = $null
        $enumValues = @()
        if ($javaType -eq "__ENUM__") {
            $enumName = (Pascal $table $true) + (Pascal $name)
            $javaType = $enumName
            $ev = [regex]::Matches($sqlType, "'([^']*)'")
            foreach ($e in $ev) {
                $enumValues += $e.Groups[1].Value
            }
        }

        $cols += [PSCustomObject]@{
            Name       = $name
            Field      = (Camel $name)
            SqlType    = $sqlType
            JavaType   = $javaType
            Nullable   = $nullable
            Auto       = $auto
            EnumName   = $enumName
            EnumValues = $enumValues
            IsPk       = $false
            IsFk       = $false
            RefTable   = $null
            RefCol     = $null
        }
    }

    $pkCols = @()
    $pkMatch = [regex]::Match($body, 'PRIMARY KEY\s*\((?<cols>[^\)]*)\)')
    if ($pkMatch.Success) {
        $pkCols = [regex]::Matches($pkMatch.Groups["cols"].Value, '`([^`]+)`') | ForEach-Object { $_.Groups[1].Value }
    }
    foreach ($c in $cols) {
        if ($pkCols -contains $c.Name) { $c.IsPk = $true }
    }

    $fkMatches = [regex]::Matches(
        $body,
        'CONSTRAINT\s+`[^`]+`\s+FOREIGN KEY\s+\(`(?<col>[^`]+)`\)\s+REFERENCES\s+`kin_conecta`\.`(?<rt>[^`]+)`\s+\(`(?<rc>[^`]+)`\)'
    )
    foreach ($fk in $fkMatches) {
        $fkCol = $fk.Groups["col"].Value
        foreach ($c in $cols) {
            if ($c.Name -eq $fkCol) {
                $c.IsFk = $true
                $c.RefTable = $fk.Groups["rt"].Value
                $c.RefCol = $fk.Groups["rc"].Value
                break
            }
        }
    }

    $schema[$table] = [PSCustomObject]@{
        Table     = $table
        Module    = (Module $table)
        Entity    = (Pascal $table $true)
        Cols      = $cols
        Pk        = $pkCols
        Composite = ($pkCols.Count -gt 1)
    }
}

$securityConfigPath = Join-Path $base "configuration/SecurityConfiguration.java"
if (Test-Path $securityConfigPath) {
    Remove-Item $securityConfigPath -Force
}

$buildGradlePath = Join-Path $root "build.gradle"
$buildGradle = Get-Content -Raw $buildGradlePath
$buildGradle = [regex]::Replace($buildGradle, "(?m)^.*spring-boot-starter-security.*\r?\n?", "")
WriteText $buildGradlePath $buildGradle

$appProps = @"
spring.application.name=kinConecta
spring.datasource.url=`${DB_URL:jdbc:mysql://localhost:3306/kin_conecta?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC}
spring.datasource.username=`${DB_USER:root}
spring.datasource.password=`${DB_PASSWORD:}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
"@
WriteText (Join-Path $root "src/main/resources/application.properties") $appProps

$exDir = Join-Path $base "configuration/exception"

WriteText (Join-Path $exDir "ResourceNotFoundException.java") @"
package org.generation.socialNetwork.configuration.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
"@

WriteText (Join-Path $exDir "BadRequestException.java") @"
package org.generation.socialNetwork.configuration.exception;

public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
"@

WriteText (Join-Path $exDir "ErrorResponse.java") @"
package org.generation.socialNetwork.configuration.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ErrorResponse {

    private int status;
    private String error;
    private String message;
    private LocalDateTime timestamp;
}
"@

WriteText (Join-Path $exDir "GlobalExceptionHandler.java") @"
package org.generation.socialNetwork.configuration.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected internal server error");
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message) {
        return ResponseEntity.status(status)
                .body(new ErrorResponse(status.value(), status.getReasonPhrase(), message, LocalDateTime.now()));
    }
}
"@

foreach ($tableName in ($schema.Keys | Sort-Object)) {
    $meta = $schema[$tableName]
    $entity = $meta.Entity
    $entityVar = $entity.Substring(0, 1).ToLower() + $entity.Substring(1)
    $idType = IdTypeFor $meta
    $module = $meta.Module
    $packageBase = "org.generation.socialNetwork.$module"

    $moduleDir = Join-Path $base $module
    $modelDir = Join-Path $moduleDir "model"
    $repoDir = Join-Path $moduleDir "repository"
    $dtoDir = Join-Path $moduleDir "dto"
    $serviceDir = Join-Path $moduleDir "service"
    $controllerDir = Join-Path $moduleDir "controller"

    EnsureDir $modelDir
    EnsureDir $repoDir
    EnsureDir $dtoDir
    EnsureDir $serviceDir
    EnsureDir $controllerDir

    foreach ($enumCol in ($meta.Cols | Where-Object { $_.EnumName })) {
        $enumName = $enumCol.EnumName
        $constants = ($enumCol.EnumValues | ForEach-Object { EnumConst $_ }) -join ",`n    "
        WriteText (Join-Path $modelDir "$enumName.java") @"
package $packageBase.model;

public enum $enumName {
    $constants
}
"@
    }

    if ($meta.Composite) {
        $idClass = "$entity`Id"
        $idFields = @()
        foreach ($pk in $meta.Pk) {
            $pkCol = $meta.Cols | Where-Object { $_.Name -eq $pk } | Select-Object -First 1
            $idFields += "    private $($pkCol.JavaType) $($pkCol.Field);"
        }
        WriteText (Join-Path $modelDir "$idClass.java") @"
package $packageBase.model;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class $idClass implements Serializable {

$($idFields -join "`n")
}
"@
    }

    $entityImports = @(
        "jakarta.persistence.*",
        "com.fasterxml.jackson.annotation.JsonIgnore",
        "lombok.AllArgsConstructor",
        "lombok.EqualsAndHashCode",
        "lombok.Getter",
        "lombok.NoArgsConstructor",
        "lombok.Setter",
        "lombok.ToString",
        "java.math.BigDecimal",
        "java.time.LocalDate",
        "java.time.LocalDateTime"
    )

    $fieldLines = @()
    $relationLines = @()
    $seenRel = @{}

    foreach ($col in $meta.Cols) {
        if ($col.IsPk) {
            $fieldLines += "    @Id"
            if (-not $meta.Composite -and $col.Auto) {
                $fieldLines += "    @GeneratedValue(strategy = GenerationType.IDENTITY)"
            }
        }
        if ($col.EnumName) {
            $fieldLines += "    @Enumerated(EnumType.STRING)"
        }
        $fieldLines += "    @Column(name = `"$($col.Name)`")"
        $fieldLines += "    private $($col.JavaType) $($col.Field);"
        $fieldLines += ""

        if ($col.IsFk) {
            $ref = $schema[$col.RefTable]
            $refEntity = $ref.Entity
            $entityImports += "org.generation.socialNetwork.$($ref.Module).model.$refEntity"

            $relNameSeed = $col.Name
            if ($relNameSeed.EndsWith("_id")) { $relNameSeed = $relNameSeed.Substring(0, $relNameSeed.Length - 3) }
            if ($relNameSeed.EndsWith("_code")) { $relNameSeed = $relNameSeed.Substring(0, $relNameSeed.Length - 5) }
            $relField = Camel $relNameSeed
            if ($seenRel.ContainsKey($relField)) {
                $seenRel[$relField] += 1
                $relField = "$relField$($seenRel[$relField])"
            } else {
                $seenRel[$relField] = 1
            }

            $relationLines += "    @ManyToOne(fetch = FetchType.LAZY)"
            $relationLines += "    @JoinColumn(name = `"$($col.Name)`", referencedColumnName = `"$($col.RefCol)`", insertable = false, updatable = false)"
            $relationLines += "    @JsonIgnore"
            $relationLines += "    @ToString.Exclude"
            $relationLines += "    @EqualsAndHashCode.Exclude"
            $relationLines += "    private $refEntity $relField;"
            $relationLines += ""
        }
    }

    $idClassAnnotation = ""
    if ($meta.Composite) {
        $idClassAnnotation = "@IdClass($entity`Id.class)`n"
    }

    WriteText (Join-Path $modelDir "$entity.java") @"
package $packageBase.model;

$(JoinImports $entityImports)

@Entity
@Table(name = `"$($meta.Table)`")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@ToString
${idClassAnnotation}public class $entity {

$($fieldLines -join "`n")
$($relationLines -join "`n")
}
"@

    $repoIdImport = ""
    if ($meta.Composite) {
        $repoIdImport = "import org.generation.socialNetwork.$module.model.$idType;`n"
    }
    WriteText (Join-Path $repoDir "$entity`Repository.java") @"
package $packageBase.repository;

import org.generation.socialNetwork.$module.model.$entity;
$repoIdImport
import org.springframework.data.jpa.repository.JpaRepository;

public interface $entity`Repository extends JpaRepository<$entity, $idType> {
}
"@

    $createCols = $meta.Cols | Where-Object { -not $_.Auto }
    $updateCols = $meta.Cols | Where-Object { -not $_.IsPk }
    $responseCols = $meta.Cols

    function BuildDto([string]$className, [array]$cols) {
        $imports = @(
            "lombok.AllArgsConstructor",
            "lombok.Getter",
            "lombok.NoArgsConstructor",
            "lombok.Setter",
            "java.math.BigDecimal",
            "java.time.LocalDate",
            "java.time.LocalDateTime",
            "$packageBase.model.*"
        )

        $dtoFields = @()
        foreach ($col in $cols) {
            $dtoFields += "    private $($col.JavaType) $($col.Field);"
        }

        return @"
package $packageBase.dto;

$(JoinImports $imports)

@Getter
@Setter
@NoArgsConstructor
public class $className {

$($dtoFields -join "`n")
}
"@
    }

    $createDto = "$entity`CreateRequestDTO"
    $updateDto = "$entity`UpdateRequestDTO"
    $responseDto = "$entity`ResponseDTO"

    WriteText (Join-Path $dtoDir "$createDto.java") (BuildDto $createDto $createCols)
    WriteText (Join-Path $dtoDir "$updateDto.java") (BuildDto $updateDto $updateCols)
    WriteText (Join-Path $dtoDir "$responseDto.java") (BuildDto $responseDto $responseCols)

    $toEntityLines = @("        $entity entity = new $entity();")
    foreach ($col in $createCols) {
        $setter = $col.Field.Substring(0, 1).ToUpper() + $col.Field.Substring(1)
        $toEntityLines += "        entity.set$setter(dto.get$setter());"
    }
    $toEntityLines += "        return entity;"

    $updateLines = @()
    foreach ($col in $updateCols) {
        $setter = $col.Field.Substring(0, 1).ToUpper() + $col.Field.Substring(1)
        $updateLines += "        entity.set$setter(dto.get$setter());"
    }

    $toResponseLines = @("        $responseDto dto = new $responseDto();")
    foreach ($col in $responseCols) {
        $setter = $col.Field.Substring(0, 1).ToUpper() + $col.Field.Substring(1)
        $toResponseLines += "        dto.set$setter(entity.get$setter());"
    }
    $toResponseLines += "        return dto;"

    WriteText (Join-Path $serviceDir "$entity`Mapper.java") @"
package $packageBase.service;

import org.generation.socialNetwork.$module.dto.$createDto;
import org.generation.socialNetwork.$module.dto.$responseDto;
import org.generation.socialNetwork.$module.dto.$updateDto;
import org.generation.socialNetwork.$module.model.$entity;

public class $entity`Mapper {

    private $entity`Mapper() {
    }

    public static $entity toEntity($createDto dto) {
$($toEntityLines -join "`n")
    }

    public static void updateEntity($entity entity, $updateDto dto) {
$($updateLines -join "`n")
    }

    public static $responseDto toResponseDTO($entity entity) {
$($toResponseLines -join "`n")
    }
}
"@

    $serviceName = "$entity`Service"
    $serviceImplName = "$entity`ServiceImpl"

    if (-not $meta.Composite) {
        $serviceInterface = @"
package $packageBase.service;

import org.generation.socialNetwork.$module.dto.$createDto;
import org.generation.socialNetwork.$module.dto.$responseDto;
import org.generation.socialNetwork.$module.dto.$updateDto;

import java.util.List;

public interface $serviceName {

    $responseDto create($createDto dto);

    $responseDto update($idType id, $updateDto dto);

    $responseDto findById($idType id);

    List<$responseDto> findAll();

    void delete($idType id);
}
"@
    } else {
        $pkParams = @()
        foreach ($pk in $meta.Pk) {
            $pkCol = $meta.Cols | Where-Object { $_.Name -eq $pk } | Select-Object -First 1
            $pkParams += "$($pkCol.JavaType) $($pkCol.Field)"
        }
        $pkParamList = $pkParams -join ", "
        $serviceInterface = @"
package $packageBase.service;

import org.generation.socialNetwork.$module.dto.$createDto;
import org.generation.socialNetwork.$module.dto.$responseDto;
import org.generation.socialNetwork.$module.dto.$updateDto;

import java.util.List;

public interface $serviceName {

    $responseDto create($createDto dto);

    $responseDto update($pkParamList, $updateDto dto);

    $responseDto findById($pkParamList);

    List<$responseDto> findAll();

    void delete($pkParamList);
}
"@
    }
    WriteText (Join-Path $serviceDir "$serviceName.java") $serviceInterface

    $serviceImports = @(
        "$packageBase.dto.$createDto",
        "$packageBase.dto.$responseDto",
        "$packageBase.dto.$updateDto",
        "$packageBase.model.$entity",
        "$packageBase.repository.$entity`Repository",
        "org.generation.socialNetwork.configuration.exception.ResourceNotFoundException",
        "lombok.RequiredArgsConstructor",
        "org.springframework.stereotype.Service",
        "java.util.List"
    )
    if ($meta.Composite) {
        $serviceImports += "$packageBase.model.$entity`Id"
    }

    $repoInjectLines = @("    private final $entity`Repository $entityVar`Repository;")
    $validateCallsCreate = @()
    $validateCallsUpdate = @()
    $validateMethods = @()

    $fkGroups = $meta.Cols | Where-Object { $_.IsFk } | Group-Object RefTable
    foreach ($fkGroup in $fkGroups) {
        $refTable = $fkGroup.Name
        $refMeta = $schema[$refTable]
        $refEntity = $refMeta.Entity
        $refIdType = IdTypeFor $refMeta
        $refRepoClass = "$refEntity`Repository"
        $refRepoVar = $refEntity.Substring(0, 1).ToLower() + $refEntity.Substring(1) + "Repository"

        $serviceImports += "org.generation.socialNetwork.$($refMeta.Module).repository.$refRepoClass"
        $repoInjectLines += "    private final $refRepoClass $refRepoVar;"

        $validatorName = "validate$refEntity`Exists"
        $validateMethods += @"
    private void $validatorName($refIdType id, String fieldName) {
        if (id == null) {
            return;
        }
        if (!$refRepoVar.existsById(id)) {
            throw new ResourceNotFoundException("$refEntity not found for " + fieldName + ": " + id);
        }
    }
"@

        foreach ($fkCol in $fkGroup.Group) {
            $getter = $fkCol.Field.Substring(0, 1).ToUpper() + $fkCol.Field.Substring(1)
            $validateCallsCreate += "        $validatorName(dto.get$getter(), `"$($fkCol.Field)`");"
            if (-not $fkCol.IsPk) {
                $validateCallsUpdate += "        $validatorName(dto.get$getter(), `"$($fkCol.Field)`");"
            }
        }
    }

    if (-not $meta.Composite) {
        $serviceImpl = @"
package $packageBase.service;

$(JoinImports $serviceImports)

@Service
@RequiredArgsConstructor
public class $serviceImplName implements $serviceName {

$($repoInjectLines -join "`n")

    @Override
    public $responseDto create($createDto dto) {
$($validateCallsCreate -join "`n")
        $entity entity = $entity`Mapper.toEntity(dto);
        return $entity`Mapper.toResponseDTO($entityVar`Repository.save(entity));
    }

    @Override
    public $responseDto update($idType id, $updateDto dto) {
        $entity entity = $entityVar`Repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("$entity not found with id: " + id));
$($validateCallsUpdate -join "`n")
        $entity`Mapper.updateEntity(entity, dto);
        return $entity`Mapper.toResponseDTO($entityVar`Repository.save(entity));
    }

    @Override
    public $responseDto findById($idType id) {
        return $entityVar`Repository.findById(id)
                .map($entity`Mapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("$entity not found with id: " + id));
    }

    @Override
    public List<$responseDto> findAll() {
        return $entityVar`Repository.findAll().stream()
                .map($entity`Mapper::toResponseDTO)
                .toList();
    }

    @Override
    public void delete($idType id) {
        if (!$entityVar`Repository.existsById(id)) {
            throw new ResourceNotFoundException("$entity not found with id: " + id);
        }
        $entityVar`Repository.deleteById(id);
    }

$($validateMethods -join "`n")
}
"@
    } else {
        $pkParams = @()
        $pkArgs = @()
        foreach ($pk in $meta.Pk) {
            $pkCol = $meta.Cols | Where-Object { $_.Name -eq $pk } | Select-Object -First 1
            $pkParams += "$($pkCol.JavaType) $($pkCol.Field)"
            $pkArgs += $pkCol.Field
        }
        $pkParamList = $pkParams -join ", "
        $pkArgList = $pkArgs -join ", "
        $idObj = "$entity`Id id = new $entity`Id($pkArgList);"
        $serviceImpl = @"
package $packageBase.service;

$(JoinImports $serviceImports)

@Service
@RequiredArgsConstructor
public class $serviceImplName implements $serviceName {

$($repoInjectLines -join "`n")

    @Override
    public $responseDto create($createDto dto) {
$($validateCallsCreate -join "`n")
        $entity entity = $entity`Mapper.toEntity(dto);
        return $entity`Mapper.toResponseDTO($entityVar`Repository.save(entity));
    }

    @Override
    public $responseDto update($pkParamList, $updateDto dto) {
        $idObj
        $entity entity = $entityVar`Repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("$entity not found with id: " + id));
$($validateCallsUpdate -join "`n")
        $entity`Mapper.updateEntity(entity, dto);
        return $entity`Mapper.toResponseDTO($entityVar`Repository.save(entity));
    }

    @Override
    public $responseDto findById($pkParamList) {
        $idObj
        return $entityVar`Repository.findById(id)
                .map($entity`Mapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("$entity not found with id: " + id));
    }

    @Override
    public List<$responseDto> findAll() {
        return $entityVar`Repository.findAll().stream()
                .map($entity`Mapper::toResponseDTO)
                .toList();
    }

    @Override
    public void delete($pkParamList) {
        $idObj
        if (!$entityVar`Repository.existsById(id)) {
            throw new ResourceNotFoundException("$entity not found with id: " + id);
        }
        $entityVar`Repository.deleteById(id);
    }

$($validateMethods -join "`n")
}
"@
    }
    WriteText (Join-Path $serviceDir "$serviceImplName.java") $serviceImpl

    $controllerName = "$entity`Controller"
    $apiPath = "/api/$($meta.Table)"
    $controllerImports = @(
        "$packageBase.dto.$createDto",
        "$packageBase.dto.$responseDto",
        "$packageBase.dto.$updateDto",
        "$packageBase.service.$serviceName",
        "lombok.RequiredArgsConstructor",
        "org.springframework.http.HttpStatus",
        "org.springframework.http.ResponseEntity",
        "org.springframework.web.bind.annotation.*",
        "java.util.List"
    )
    if ($meta.Composite) {
        $pathPairs = @()
        $svcArgs = @()
        foreach ($pk in $meta.Pk) {
            $pkCol = $meta.Cols | Where-Object { $_.Name -eq $pk } | Select-Object -First 1
            $pathPairs += "@PathVariable $($pkCol.JavaType) $($pkCol.Field)"
            $svcArgs += $pkCol.Field
        }
        $pathParams = $pathPairs -join ", "
        $svcArgList = $svcArgs -join ", "
        $pathTemplate = "/" + (($meta.Pk | ForEach-Object { "{$(Camel $_)}" }) -join "/")

        $controllerContent = @"
package $packageBase.controller;

$(JoinImports $controllerImports)

@RestController
@RequestMapping("$apiPath")
@RequiredArgsConstructor
public class $controllerName {

    private final $serviceName service;

    @PostMapping
    public ResponseEntity<$responseDto> create(@RequestBody $createDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<$responseDto>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("$pathTemplate")
    public ResponseEntity<$responseDto> findById($pathParams) {
        return ResponseEntity.ok(service.findById($svcArgList));
    }

    @PutMapping("$pathTemplate")
    public ResponseEntity<$responseDto> update($pathParams, @RequestBody $updateDto dto) {
        return ResponseEntity.ok(service.update($svcArgList, dto));
    }

    @DeleteMapping("$pathTemplate")
    public ResponseEntity<Void> delete($pathParams) {
        service.delete($svcArgList);
        return ResponseEntity.noContent().build();
    }
}
"@
    } else {
        $pkCol = $meta.Cols | Where-Object { $_.IsPk } | Select-Object -First 1
        $pkType = $pkCol.JavaType

        $controllerContent = @"
package $packageBase.controller;

$(JoinImports $controllerImports)

@RestController
@RequestMapping("$apiPath")
@RequiredArgsConstructor
public class $controllerName {

    private final $serviceName service;

    @PostMapping
    public ResponseEntity<$responseDto> create(@RequestBody $createDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<$responseDto>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<$responseDto> findById(@PathVariable("id") $pkType id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<$responseDto> update(@PathVariable("id") $pkType id, @RequestBody $updateDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") $pkType id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
"@
    }
    WriteText (Join-Path $controllerDir "$controllerName.java") $controllerContent
}

Write-Host "Generation complete."
