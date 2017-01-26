/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package wad.service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sun.misc.BASE64Decoder;

/**
 *
 * @author Asus
 */
@Service
public class ImageService {
    
    private String uploadPath;
    
    @Autowired
    AdminBot adminBot;

    public String getUploadPath() {
        return uploadPath;
    }

    public void setUploadPath(String uploadPath) {
        this.uploadPath = uploadPath;
    }
    
    
    
    public void addDrawing(String cname, String imageBase64) throws IOException{
             System.out.println("Tulitilu");
            // tokenize the data
            String[] parts = imageBase64.split(",");
            String imageString = parts[1];
            // create a buffered image
            BufferedImage image = null;
            byte[] imageByte;

            BASE64Decoder decoder = new BASE64Decoder();
            imageByte = decoder.decodeBuffer(imageString);
            ByteArrayInputStream bis = new ByteArrayInputStream(imageByte);
            image = ImageIO.read(bis);
            bis.close();

            // write the image to a file
             File dest = new File(uploadPath + cname);
            ImageIO.write(image, "png", dest);
    }
    
    public void addImage(MultipartFile file) throws IOException{
                    System.out.println("Kuvan tiedot: "+file.getContentType() +" " +file.getBytes().length);
            if (!file.isEmpty()&&file.getBytes().length<2000000) {
                if(file.getContentType().equals("image/gif")||file.getContentType().equals("image/png")||file.getContentType().equals("image/jpeg")){
                    try {

                        if(! new File(uploadPath).exists()){
                            new File(uploadPath).mkdir();
                        }
                        if(adminBot.getUploadPath()==null)
                            adminBot.setUploadPath(uploadPath);
                        File dest = new File(uploadPath + file.getOriginalFilename());
                        file.transferTo(dest);
                    }catch(Exception e){}
                }
            }
    }
    
    
}
