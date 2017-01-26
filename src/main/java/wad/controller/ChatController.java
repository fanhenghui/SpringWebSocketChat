package wad.controller;


import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.UUID;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import wad.WebSocketDisconnectListener;
import wad.domain.Message;
import wad.domain.User;
import wad.service.AdminBot;
import wad.service.MessageService;
import wad.service.UserService;

import wad.service.ImageService;

@Controller
public class ChatController {

    @Autowired
    private MessageService messageService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private WebSocketDisconnectListener listener;
    
    @Autowired
    private HttpServletRequest request;
    
    @Autowired 
    private AdminBot adminBot;
    
    @Autowired
    private ImageService imageService;

    @RequestMapping(value = "/login", method = RequestMethod.POST)
    public String login(HttpServletRequest request,Model model, @RequestParam("name") String username, @RequestParam("channel") String channel) {
        User user = new User();
        user.setIp(request.getRemoteAddr().toString());
        user.setUsername(username);
        user = userService.checkUser(user);
        if(user.getUsername().equals("**TAKEN**"))
            return "redirect:/login/error/1";
        if(user.getUsername().length()<2||user.getUsername().length()>20)
            return "redirect:/login/error/2";
        System.out.println("Miksi: " + user.getPrivateKey());
        if(user.getPrivateKey()==null)
            user.setPrivateKey(UUID.randomUUID().toString());
        this.listener.addUser(user);
        model.addAttribute("channel", channel);
        model.addAttribute("username", user.getUsername());
        model.addAttribute("pkey", user.getPrivateKey());
        
        return "chat";
    }
    //Error ID:s 1:username taken. 2:Username length
    @RequestMapping(value="/login/error/{id}")
    public String loginError(Model model, @PathVariable int id){
        if(id==1)
            model.addAttribute("error", "Username is taken, please choose another.");
        if(id==2)
            model.addAttribute("error", "Username legth has to be between 2 and 20 characters.");        
        return "index";
    }
    
    @RequestMapping(value="/photo")
    public ResponseEntity<String> photo(@RequestParam(required=false) MultipartFile file, @RequestParam(required=false, value="imageBase64")String imageBase64,@RequestParam(required=false, value="cname")String cname) throws IOException{
        System.out.println("Cname: " + cname);
        this.imageService.setUploadPath(request.getServletContext().getRealPath("/uploads/"));

        System.out.println("Kuva: " + imageBase64);
        if(imageBase64!=null){
            imageService.addDrawing(cname, imageBase64);
            return new ResponseEntity<String>(HttpStatus.OK);
        }else{
            imageService.addImage(file);
            return new ResponseEntity<String>(HttpStatus.OK);
        }
        
    }
    
    @RequestMapping(value="/sound")
    public ResponseEntity<String> sound(@RequestParam(required=false) MultipartFile file) throws IOException{
        System.out.println("Filu: " + file);
        File dest = new File(request.getServletContext().getRealPath("/uploads/") + file.getOriginalFilename());
        file.transferTo(dest);
        return new ResponseEntity<String>(HttpStatus.OK);
    }


    @MessageMapping("/messages")
    public void handleMessage(Message message) throws Exception {
        String timeStamp = new SimpleDateFormat("HH:mm:ss").format(Calendar.getInstance().getTime());
        message.setTime(timeStamp);
        System.out.println("MSG user: " + message.getUsername() + " : " + message.getPkey());
        User u =userService.getUserByName(message.getUsername());
        if(u!=null){
            if(message.getPkey().equals(u.getPrivateKey())){
                message.setPkey("0");
                messageService.addMessage(message);
                if(message.getContent().trim().length()>1){
                    if(message.getContent().trim().charAt(0)=='/'){
                        messageService.handleCommand(message);
                    }
                }
                userService.getUsers();
            }
        }
    }
    @MessageMapping("/getusers")
    public void loadUsers()throws Exception{
        userService.getUsers();
    }
    
    @MessageMapping("/close")
    public void closeChat(String name)throws Exception{
        System.out.println("Cloussaa se");                
    }
}
