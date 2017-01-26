/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package wad;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import wad.domain.User;
import wad.service.UserService;


@Component
public class WebSocketDisconnectListener implements ApplicationListener {
    
    @Autowired
    UserService userService;
    
    
    private User user = null;

    @EventListener
    @Override
    public void onApplicationEvent(ApplicationEvent e) {
        
        if(e.getClass()==SessionConnectEvent.class){
            SessionConnectEvent ev = (SessionConnectEvent) e;
            userService.addUser(ev.getMessage().getHeaders().get("simpSessionId").toString(), user);
        }
        if(e.getClass()==SessionDisconnectEvent.class){
            SessionDisconnectEvent ev = (SessionDisconnectEvent) e;
            this.userService.deleteUser(ev.getMessage().getHeaders().get("simpSessionId").toString());
        }

    }
    
    public void addUser(User user){
        this.user = user;
    }
    
  
}
