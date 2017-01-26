package wad.service;

import java.io.IOException;
import javax.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import wad.domain.Message;
import wad.domain.User;

@Service
public class MessageService {

    

    @Autowired
    private AdminBot adminBot;
    
    @Autowired
    private UserService userService;
    

    @Autowired
    private SimpMessagingTemplate template;

    public void addMessage(Message message) {
        this.template.convertAndSend("/channel/" + message.getChannel(), message);
    }
    

    public void handleCommand(Message message) throws IOException{
        String content = message.getContent().trim();
        
        if(content.equals("/RasistiBot kerro vitsi"))
            this.send();
        if(content.equals("/AdminBot clear uploads"))
            adminBot.clearImages();
    }
    
    public void userLogin(String user){
        System.out.println("userLogin tuli");
        this.template.convertAndSend("/channel/default", adminBot.getLoginMessage(user));
    }
    public void userLogout(String user){
        System.out.println("userLogout tuli");
        this.template.convertAndSend("/channel/default", adminBot.getLogoutMessage(user));
    }
    
    public void send() {
    }
    
    @PostConstruct
    public void init(){
        //userService.addUser("ad112mi112nbot", new User(adminBot.getName()));
    }
    
    
  
}
