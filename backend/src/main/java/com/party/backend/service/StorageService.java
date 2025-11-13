package com.party.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URL;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StorageService {

    private final S3Client s3Client;
    private final String BUCKET_NAME = "party-listings";

    @Value("${aws.s3.public-url}")
    private String publicUrl;

    public String uploadFile(MultipartFile file) {
        try {
            String extension = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
            String fileName = UUID.randomUUID().toString() + extension;

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(BUCKET_NAME)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return publicUrl + "/" + BUCKET_NAME + "/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException("Falha ao fazer upload do ficheiro", e);
        }
    }

    public void deleteFile(String fileUrl) {
        try {
            String key = new URL(fileUrl).getPath().substring(("/" + BUCKET_NAME + "/").length());
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(BUCKET_NAME)
                    .key(key)
                    .build();
            s3Client.deleteObject(deleteObjectRequest);
        } catch (Exception e) {
            System.err.println("Falha ao apagar o ficheiro do S3: " + fileUrl + " - Erro: " + e.getMessage());
        }
    }
}