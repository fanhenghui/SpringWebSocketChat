/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package wad.service;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Random;
import org.springframework.stereotype.Service;
import wad.domain.Message;

/**
 *
 * @author Asus
 */
@Service
public class RoBotti {
    
    private final String[] sanat = {"MOIMOI!", "Mitäs kuuluu", "Hyvää. kiitos kysymästä!", "Ompas aurinkoinen päivä",
            "Hehhehheh", "Moi!", "MORO!", "TRAAAAARERA", "Testtituttaa", "LOL", "asdfg"};
    
    
     public Message getMessage() {
        Message msg = new Message();
        msg.setContent(sanat[new Random().nextInt(sanat.length)]);
        msg.setUsername("JK");
        String timeStamp = new SimpleDateFormat("HH:mm:ss").format(Calendar.getInstance().getTime());
        msg.setTime(timeStamp);
        return msg;
    }
    
}
