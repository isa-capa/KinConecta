$ErrorActionPreference = "Stop"

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

$root = (Get-Location).Path
$sqlPath = Join-Path $root "kinConnect.sql"
$modelsRoot = Join-Path $root "src/main/java/org/generation/socialNetwork"

$sql = Get-Content -Raw $sqlPath

$enumMap = @{}
$enumFiles = Get-ChildItem -Recurse -File -Path $modelsRoot -Filter "*.java" | Where-Object {
    $_.DirectoryName -match "\\model$" -and $_.Name -notmatch "Id\.java$"
}

foreach ($ef in $enumFiles) {
    $content = Get-Content -Raw $ef.FullName
    if ($content -match "public enum\s+([A-Za-z0-9_]+)\s*\{(?<body>[\s\S]*?)\}") {
        $enumName = $Matches[1]
        $body = $Matches["body"]
        $constants = @()
        foreach ($line in ($body -split "`n")) {
            $clean = $line.Trim().Trim(",")
            if ($clean -match "^[A-Z0-9_]+$") {
                $constants += $clean
            }
        }
        if ($constants.Count -gt 0) {
            $enumMap[$enumName] = $constants
        }
    }
}

$entityFiles = Get-ChildItem -Recurse -File -Path $modelsRoot -Filter "*.java" | Where-Object {
    $_.DirectoryName -match "\\model$" -and $_.Name -notmatch "Id\.java$"
}

$enumColumns = @()
foreach ($file in $entityFiles) {
    $content = Get-Content -Raw $file.FullName
    if ($content -notmatch "@Entity") { continue }
    if ($content -notmatch "@Table\(name = ""([^""]+)""\)") { continue }
    $table = $Matches[1]

    $pattern = "@Enumerated\(EnumType\.STRING\)\s*@Column\(name = ""(?<col>[^""]+)""\)\s*private\s+(?<type>[A-Za-z0-9_]+)\s+[A-Za-z0-9_]+;"
    $matches = [regex]::Matches($content, $pattern, [Text.RegularExpressions.RegexOptions]::Singleline)
    foreach ($m in $matches) {
        $col = $m.Groups["col"].Value
        $type = $m.Groups["type"].Value
        if ($enumMap.ContainsKey($type)) {
            $enumColumns += [PSCustomObject]@{
                Table = $table
                Column = $col
                EnumValues = $enumMap[$type]
            }
        }
    }
}

foreach ($ec in $enumColumns) {
    $escapedTable = [regex]::Escape($ec.Table)
    $escapedColumn = [regex]::Escape($ec.Column)
    $tablePattern = '(CREATE TABLE IF NOT EXISTS `kin_conecta`\.`{0}` \()(?<body>[\s\S]*?)(\)\s*ENGINE\s*=\s*InnoDB)' -f $escapedTable
    $tableMatch = [regex]::Match($sql, $tablePattern)
    if (-not $tableMatch.Success) { continue }

    $body = $tableMatch.Groups["body"].Value
    $enumList = ($ec.EnumValues | ForEach-Object { "'$_'" }) -join ", "

    $linePattern = '(?m)^(\s*`{0}`\s+)ENUM\([^\)]*\)(?<tail>[^\r\n]*)(?<comma>,?)$' -f $escapedColumn
    $body = [regex]::Replace($body, $linePattern, {
        param($m)
        $tail = $m.Groups["tail"].Value
        $tail = [regex]::Replace($tail, "DEFAULT\s+'([^']*)'", {
            param($d)
            "DEFAULT '" + (EnumConst $d.Groups[1].Value) + "'"
        })
        return $m.Groups[1].Value + "ENUM(" + $enumList + ")" + $tail + $m.Groups["comma"].Value
    })

    $sql = $sql.Substring(0, $tableMatch.Groups["body"].Index) + $body + $sql.Substring($tableMatch.Groups["body"].Index + $tableMatch.Groups["body"].Length)
}

[System.IO.File]::WriteAllText($sqlPath, $sql, [System.Text.UTF8Encoding]::new($false))
Write-Host "kinConnect.sql synchronized with enum values from Java model."
