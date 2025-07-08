package com.example.localllmchat;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
    
    private LinearLayout chatContainer;
    private EditText messageInput;
    private Button sendButton;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        chatContainer = findViewById(R.id.chatContainer);
        messageInput = findViewById(R.id.messageInput);
        sendButton = findViewById(R.id.sendButton);
        
        sendButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                sendMessage();
            }
        });
        
        // Add welcome message
        addMessage("Xin chào! Đây là app chat đơn giản.");
    }
    
    private void sendMessage() {
        String message = messageInput.getText().toString().trim();
        if (!message.isEmpty()) {
            addMessage("Bạn: " + message);
            messageInput.setText("");
            
            // Simple auto reply
            addMessage("Bot: Tôi đã nhận được tin nhắn: " + message);
        }
    }
    
    private void addMessage(String message) {
        TextView messageView = new TextView(this);
        messageView.setText(message);
        messageView.setTextSize(16);
        messageView.setPadding(16, 8, 16, 8);
        messageView.setBackgroundColor(0xFFE0E0E0);
        
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 4, 0, 4);
        messageView.setLayoutParams(params);
        
        chatContainer.addView(messageView);
    }
}
