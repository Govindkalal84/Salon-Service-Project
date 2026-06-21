package com.zosh.service;

import com.zosh.payload.dto.*;
import com.zosh.payload.response.TokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class
KeycloakService {

    private static final String KEYCLOAK_BASE_URL="https://lemur-18.cloud-iam.com/auth";
    private static final String KEYCLOAK_ADMIN_API=KEYCLOAK_BASE_URL+"/admin/realms/salon-auth-test/users";


    private  static final String TOKEN_URL=KEYCLOAK_BASE_URL+"/realms/salon-auth-test/protocol/openid-connect/token";

    private static final String CLIENT_ID="salon-app";
    private static final String CLIENT_SECRET="KehTI3vBOfxH0KZvVumUJ7iSh0CArWRP";

    private  static final String GRANT_TYPE="password";
    private  static final String scope="openid profile email";
    private  static  final  String username="admin";
    private  static  final  String password="Govind@123";
    private  static final  String clientId="2519b4a9-f3b1-465e-8247-cff93f89037e";


    private  final RestTemplate restTemplate;

    public void createUser(SignupDTO signupDTO) throws Exception{

        String ACCESS_TOKEN=getAdminAccessToken(username,
                password,
                GRANT_TYPE,null).getAccessToken();

        Credential credential=new Credential();
        credential.setTemporary(false);
        credential.setType("password");
        credential.setValue(signupDTO.getPassword());

        String fullName = signupDTO.getFullName();
        String firstName = signupDTO.getUsername();
        String lastName = "";
        if (fullName != null && !fullName.trim().isEmpty()) {
            String[] parts = fullName.trim().split("\\s+", 2);
            firstName = parts[0];
            if (parts.length > 1) {
                lastName = parts[1];
            }
        }

        UserRequest  userRequest=new UserRequest();
        userRequest.setUsername(signupDTO.getUsername());
        userRequest.setEmail(signupDTO.getEmail());
        userRequest.setEnabled(true);
        userRequest.setEmailVerified(true);
        userRequest.setFirstName(firstName);
        userRequest.setLastName(lastName);
        userRequest.getCredentials().add(credential);


        HttpHeaders headers=new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(ACCESS_TOKEN);

        HttpEntity<UserRequest> requestEntity=new HttpEntity<>(userRequest,headers);

        ResponseEntity<String> response=restTemplate.exchange(

                KEYCLOAK_ADMIN_API,
                HttpMethod.POST,
                requestEntity,
                String.class

        );
        if (response.getStatusCode()==HttpStatus.CREATED){

            System.out.println("user created successfully");

            KeycloakUserDTO user=fetchFirstUserByUsername(signupDTO.getUsername(),ACCESS_TOKEN);


            KeycloakRole role=getRoleByName(clientId,ACCESS_TOKEN,signupDTO.getRole().toString());

            List<KeycloakRole> roles=new ArrayList<>();
            roles.add(role);

            assignRoleToUser(user.getId(),
                    clientId,
                    roles,
                    ACCESS_TOKEN);

        }
        else {
            System.out.println("user creation failed");
            throw new Exception(response.getBody());
        }

    }
    public TokenResponse getAdminAccessToken(String username,
                                             String password,
                                             String grantType,
                                             String refreshToken) throws Exception {

        HttpHeaders headers=new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> requestBody=new LinkedMultiValueMap<>();
        requestBody.add("grant_type",grantType);
        requestBody.add("username",username);
        requestBody.add("password",password);
        requestBody.add("refresh_token",refreshToken);
        requestBody.add("client_id",CLIENT_ID);
        requestBody.add("client_secret",CLIENT_SECRET);
        requestBody.add("scope",scope);


        HttpEntity<MultiValueMap<String,String>> requestEntity=
                new HttpEntity<>(requestBody,headers);

        ResponseEntity<TokenResponse> response=restTemplate.exchange(

                TOKEN_URL,
                HttpMethod.POST,
                requestEntity,
                TokenResponse.class

        );
        if(response.getStatusCode()==HttpStatus.OK && response.getBody()!=null){

            return response.getBody();

        }
        throw new Exception("Failed to obtain access token");

    }

    public KeycloakRole getRoleByName(String clientId,
                                      String token,
                                      String role) {

        String url=KEYCLOAK_BASE_URL+"/admin/realms/salon-auth-test/clients/"+clientId+"/roles/"+role;

        HttpHeaders headers=new HttpHeaders();
        headers.set("Authorization", "Bearer "+token);
        headers.setContentType(MediaType.APPLICATION_JSON);



        HttpEntity<Void> requestEntity=
                new HttpEntity<>(headers);

        ResponseEntity<KeycloakRole> response=restTemplate.exchange(

                url,
                HttpMethod.GET,
                requestEntity,
                KeycloakRole.class

        );
            return response.getBody();
    }

    public KeycloakUserDTO fetchFirstUserByUsername(String username, String token) throws Exception {

        String url=KEYCLOAK_BASE_URL+"/admin/realms/salon-auth-test/users?username="+username;

        HttpHeaders headers=new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);



        HttpEntity<String> requestEntity=
                new HttpEntity<>(headers);

        ResponseEntity<KeycloakUserDTO[]> response=restTemplate.exchange(

                url,
                HttpMethod.GET,
                requestEntity,
                KeycloakUserDTO[].class

        );
        KeycloakUserDTO[] users=response.getBody();
        if (users!=null && users.length>0) {
            return users[0];
        }

         throw new Exception("user not found with username "+username);
    }

    public void assignRoleToUser(String userId,
                                 String clientId,
                                 List<KeycloakRole> roles,
                                 String token) throws Exception {


        String url=KEYCLOAK_BASE_URL+"/admin/realms/salon-auth-test/users/"+userId+"/role-mappings/clients/"+clientId;

        HttpHeaders headers=new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);



        HttpEntity<List<KeycloakRole>> requestEntity=
                new HttpEntity<>(roles,headers);


        try {
            ResponseEntity<String> response=restTemplate.exchange(

                    url,
                    HttpMethod.POST,
                    requestEntity,
                    String.class

            );

        }catch (Exception e){
            throw  new Exception("Failed to assign new role"+e.getMessage());
        }

    }



    public KeycloakUserDTO fetchUserProfileByJwt(String token
                                 ) throws Exception {


        String url=KEYCLOAK_BASE_URL+"/realms/salon-auth-test/protocol/openid-connect/userinfo";

        HttpHeaders headers=new HttpHeaders();
        headers.set("Authorization", token);
        headers.setContentType(MediaType.APPLICATION_JSON);



        HttpEntity<String> requestEntity=
                new HttpEntity<>(headers);


        try {
            ResponseEntity<KeycloakUserDTO> response=restTemplate.exchange(

                    url,







                    HttpMethod.GET,
                    requestEntity,
                    KeycloakUserDTO.class

            );
            return response.getBody();

        }catch (Exception e){
            throw  new Exception("Failed to get user info"+e.getMessage());
        }

    }

}
