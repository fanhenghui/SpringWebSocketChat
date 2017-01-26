/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package wad.service;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import org.apache.commons.io.FileUtils;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import wad.domain.Message;
/**
 *
 * @author Asus
 */
@Service
public class AdminBot {
    
    private String name = "AdminBot";
    
    private String uploadPath;
    
    private Message template;
    
    public AdminBot(){
        template = new Message();
        template.setContent("");
        template.setUsername(name);
        template.setPkey("ad898m234i223455n");
    }
    
    public String getName() {
        return name;
    }
    
    @Scheduled(fixedDelay = 900000)
    public void clearImages() throws IOException{
        if(uploadPath!=null){
            int count = new File(uploadPath).list().length;
            if(count>=3){
                FileUtils.cleanDirectory(new File(uploadPath)); 
                System.out.println("Kuvia poistettu "+count);
            }
        }
    }

    public String getUploadPath() {
        return uploadPath;
    }

    public void setUploadPath(String uploadPath) {
        
        this.uploadPath = uploadPath;
    }
    public Message getLoginMessage(String name){
        Message msg = this.template;
        msg.setContent("Käyttäjä " + name + " liittyi keskusteluun.");
        msg.setTime(new SimpleDateFormat("HH:mm:ss").format(Calendar.getInstance().getTime()));
        return msg;
    }
    public Message getLogoutMessage(String name){
        Message msg = this.template;
        msg.setContent("Käyttäjä " + name + " poistui keskustelusta.");
        msg.setTime(new SimpleDateFormat("HH:mm:ss").format(Calendar.getInstance().getTime()));
        return msg;
    }
    
}
