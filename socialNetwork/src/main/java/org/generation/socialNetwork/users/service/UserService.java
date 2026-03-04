package generation.socialNetwork.users.service;

import generation.socialNetwork.users.model.User;
import generation.socialNetwork.users.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    //Añadir un nuevo usuario
    public User addUser(User user){
        String passwordEncripted = passwordEncoder.encode(user.getPassword());
        user.setPassword(passwordEncripted);
        return this.userRepository.save(user);
    }

    //Ver todos los usuarios
    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    //Ver un sólo usuario
    public User getUserById(Long id){
        return userRepository.findById(id).orElseThrow(
                () -> new IllegalArgumentException("El usuario con la id " + id + "no existe.")
        );
    }

    //Actualizar usuario
    public User updateUserById(Long id, User updatedUser){
        Optional<User> optionalUser = userRepository.findById(id);
        if(optionalUser.isEmpty()) throw new IllegalArgumentException("El usuario con la id " + id + "no existe.");
        User originalUser = optionalUser.get();

        if (updatedUser.getRole() != null) originalUser.setRole(updatedUser.getRole());
        if (updatedUser.getFullName() != null) originalUser.setFullName(updatedUser.getFullName());
        if (updatedUser.getDateOfBirth() != null) originalUser.setDateOfBirth(updatedUser.getDateOfBirth());
        if (updatedUser.getEmail() != null) originalUser.setEmail(updatedUser.getEmail());
        if (updatedUser.getPassword() != null) originalUser.setPassword(updatedUser.getPassword());
        if (updatedUser.getCountryCode() != null) originalUser.setCountryCode(updatedUser.getCountryCode());
        if (updatedUser.getPhoneNumber() != null) originalUser.setPhoneNumber(updatedUser.getPhoneNumber());
        if (updatedUser.getPhoneE164() != null) originalUser.setPhoneE164(updatedUser.getPhoneE164());
        if (updatedUser.getPreferedLanguageCode() != null) originalUser.setPreferedLanguageCode(updatedUser.getPreferedLanguageCode());
        if (updatedUser.getAccountStatus() != null) originalUser.setAccountStatus(updatedUser.getAccountStatus()); //SET AUTOMATICO
        if (updatedUser.getEmailVerifiedAt() != null) originalUser.setEmailVerifiedAt(updatedUser.getEmailVerifiedAt()); //SET AUTOMATICO
        if (updatedUser.getLastLogin() != null) originalUser.setLastLogin(updatedUser.getLastLogin()); //SET AUTOMATICO
        if (updatedUser.getCreatedAt() != null) originalUser.setCreatedAt(updatedUser.getCreatedAt()); //SET AUTOMATICO
        if (updatedUser.getUpdatedAt() != null) originalUser.setUpdatedAt(updatedUser.getUpdatedAt()); //SET AUTOMATICO

        return userRepository.save(originalUser);
    }

    public User deleteUserById(Long id){
        Optional<User> optionalUser = userRepository.findById(id);
        if(optionalUser.isEmpty()) throw new IllegalArgumentException("El usuario con la id " + id + " no existe.");
        userRepository.deleteById(id);
        return optionalUser.get();
    }

    //Ingreso correcto del usuario.
    public boolean validateUser(User user){
        Optional<User> optionalUser = userRepository.findByEmail(user.getEmail());
        if(optionalUser.isEmpty()) throw new IllegalArgumentException("Las credenciales son incorrectas. Intente nuevamente.");
        return passwordEncoder.matches(user.getPassword(),optionalUser.get().getPassword());
    }


}
