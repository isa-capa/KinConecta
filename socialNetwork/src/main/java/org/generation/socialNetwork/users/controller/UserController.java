package generation.socialNetwork.users.controller;

import generation.socialNetwork.users.model.User;
import generation.socialNetwork.users.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/kinconecta/api/user") //http://localhost:8080/kinconecta/api/user
@AllArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping(path="/login") //http://localhost:8080/kinconecta/api/user/login
    public boolean loginUser(@RequestBody User user){
        return userService.validateUser(user);
    }

    //GET ALL USERS
    @GetMapping
    public List<User> getAllUsers(){
        return userService.getAllUsers();
    }

    //GET USER BY ID
    @GetMapping(path="/{fullName}_{userId}")
    public User getUserById(@PathVariable("userId")Long id){
        return userService.getUserById(id);
    }

    //ADD USER
    @PostMapping
    public User addUser(@RequestBody User user){
        return userService.addUser(user);
    }

    @DeleteMapping(path="/{fullName}_{userId}")
    public User deleteUserById(@PathVariable("userId")Long id){
        return userService.deleteUserById(id);
    }

    @PutMapping(path="{fullName}_{userId}")
    public User updateUserById(@PathVariable("userId")Long id, @RequestBody User user){
        return userService.updateUserById(id,user);
    }
}
