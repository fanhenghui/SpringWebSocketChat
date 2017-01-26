/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package wad.domain;

import javax.persistence.Entity;
import org.springframework.data.jpa.domain.AbstractPersistable;


/**
 *
 * @author Asus
 */
@Entity
public class User extends AbstractPersistable<Long>{
    

    private String username;
    
    private String ip;
    
    private String privateKey;

    public User() {
    }
    public User(String name){
        this.username = username;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public String getPrivateKey() {
        return privateKey;
    }

    public void setPrivateKey(String privateKey) {
        this.privateKey = privateKey;
    }
    
}
