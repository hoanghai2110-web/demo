package com.example.localllmchat

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.launch
import okhttp3.*
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

data class ChatMessage(
    val sender: String,
    val content: String,
    val isUser: Boolean
)

class ChatViewModel : ViewModel() {
    private val _messages = mutableStateListOf<ChatMessage>()
    val messages: List<ChatMessage> = _messages
    
    private val _isModelDownloaded = mutableStateOf(false)
    val isModelDownloaded: State<Boolean> = _isModelDownloaded
    
    private val _downloadProgress = mutableStateOf(0)
    val downloadProgress: State<Int> = _downloadProgress
    
    private val _isDownloading = mutableStateOf(false)
    val isDownloading: State<Boolean> = _isDownloading
    
    private val _progressText = mutableStateOf("")
    val progressText: State<String> = _progressText

    private val httpClient = OkHttpClient()
    private val executorService: ExecutorService = Executors.newSingleThreadExecutor()
    private val mainHandler = Handler(Looper.getMainLooper())
    
    companion object {
        private const val MODEL_URL = "https://huggingface.co/unsloth/gemma-3n-E2B-it-GGUF/resolve/main/gemma-3n-E2B-it-UD-IQ2_XXS.gguf"
        private const val MODEL_FILENAME = "gemma-3n-E2B-it-UD-IQ2_XXS.gguf"
    }
    
    fun checkModelExists(context: android.content.Context) {
        val modelFile = File(context.filesDir, MODEL_FILENAME)
        _isModelDownloaded.value = modelFile.exists()
        
        if (_isModelDownloaded.value && _messages.isEmpty()) {
            _messages.add(ChatMessage("Hệ thống", "Model đã sẵn sàng! Bạn có thể bắt đầu trò chuyện.", false))
        }
    }
    
    fun downloadModel(context: android.content.Context) {
        _isDownloading.value = true
        _progressText.value = "Đang chuẩn bị tải xuống..."
        
        val request = Request.Builder().url(MODEL_URL).build()
        
        httpClient.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                mainHandler.post {
                    Toast.makeText(context, "Lỗi tải xuống: ${e.message}", Toast.LENGTH_LONG).show()
                    _isDownloading.value = false
                }
            }
            
            override fun onResponse(call: Call, response: Response) {
                if (!response.isSuccessful) {
                    mainHandler.post {
                        Toast.makeText(context, "Lỗi server: ${response.code}", Toast.LENGTH_LONG).show()
                        _isDownloading.value = false
                    }
                    return
                }
                
                val body = response.body
                if (body == null) {
                    mainHandler.post {
                        Toast.makeText(context, "Không thể tải dữ liệu", Toast.LENGTH_LONG).show()
                        _isDownloading.value = false
                    }
                    return
                }
                
                try {
                    val contentLength = body.contentLength()
                    val inputStream: InputStream = body.byteStream()
                    
                    val outputFile = File(context.filesDir, MODEL_FILENAME)
                    val outputStream = FileOutputStream(outputFile)
                    
                    val buffer = ByteArray(8192)
                    var downloadedBytes = 0L
                    var bytesRead: Int
                    
                    while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                        outputStream.write(buffer, 0, bytesRead)
                        downloadedBytes += bytesRead
                        
                        if (contentLength > 0) {
                            val progress = ((downloadedBytes * 100) / contentLength).toInt()
                            
                            mainHandler.post {
                                _downloadProgress.value = progress
                                _progressText.value = String.format(
                                    "Đã tải: %.1f MB / %.1f MB (%d%%)",
                                    downloadedBytes / (1024.0 * 1024.0),
                                    contentLength / (1024.0 * 1024.0),
                                    progress
                                )
                            }
                        }
                    }
                    
                    outputStream.close()
                    inputStream.close()
                    
                    mainHandler.post {
                        Toast.makeText(context, "Tải model thành công!", Toast.LENGTH_SHORT).show()
                        _isDownloading.value = false
                        _isModelDownloaded.value = true
                        _messages.add(ChatMessage("Hệ thống", "Model đã sẵn sàng! Bạn có thể bắt đầu trò chuyện.", false))
                    }
                } catch (e: IOException) {
                    mainHandler.post {
                        Toast.makeText(context, "Lỗi lưu file: ${e.message}", Toast.LENGTH_LONG).show()
                        _isDownloading.value = false
                    }
                }
            }
        })
    }
    
    fun sendMessage(prompt: String) {
        if (prompt.isBlank()) return
        
        _messages.add(ChatMessage("Bạn", prompt, true))
        
        // Simulate response
        mainHandler.postDelayed({
            _messages.add(ChatMessage("Assistant", "Model đang được tích hợp... Phản hồi cho: \"$prompt\"", false))
        }, 1000)
    }
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            LocalLLMChatTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    ChatScreen()
                }
            }
        }
    }
}

@Composable
fun LocalLLMChatTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = Color(0xFF6200EE),
            secondary = Color(0xFF03DAC6),
            background = Color(0xFFF5F5F5)
        ),
        content = content
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(viewModel: ChatViewModel = viewModel()) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val listState = rememberLazyListState()
    var inputText by remember { mutableStateOf("") }
    
    LaunchedEffect(Unit) {
        viewModel.checkModelExists(context)
    }
    
    LaunchedEffect(viewModel.messages.size) {
        if (viewModel.messages.isNotEmpty()) {
            coroutineScope.launch {
                listState.animateScrollToItem(viewModel.messages.size - 1)
            }
        }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Header
        Text(
            text = "Local LLM Chat",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        // Download section
        if (!viewModel.isModelDownloaded.value && !viewModel.isDownloading.value) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Model chưa được tải xuống",
                        fontSize = 16.sp,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                    Button(
                        onClick = { viewModel.downloadModel(context) },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Tải Model")
                    }
                }
            }
        }
        
        // Download progress
        if (viewModel.isDownloading.value) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = viewModel.progressText.value,
                        fontSize = 14.sp,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                    LinearProgressIndicator(
                        progress = viewModel.downloadProgress.value / 100f,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
        
        // Chat messages
        LazyColumn(
            state = listState,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(viewModel.messages) { message ->
                ChatMessageItem(message = message)
            }
        }
        
        // Input section
        if (viewModel.isModelDownloaded.value) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = inputText,
                    onValueChange = { inputText = it },
                    placeholder = { Text("Nhập tin nhắn...") },
                    modifier = Modifier.weight(1f),
                    maxLines = 3
                )
                Spacer(modifier = Modifier.width(8.dp))
                Button(
                    onClick = {
                        viewModel.sendMessage(inputText)
                        inputText = ""
                    },
                    enabled = inputText.isNotBlank()
                ) {
                    Text("Gửi")
                }
            }
        }
    }
}

@Composable
fun ChatMessageItem(message: ChatMessage) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (message.isUser) Arrangement.End else Arrangement.Start
    ) {
        Card(
            modifier = Modifier.widthIn(max = 280.dp),
            colors = CardDefaults.cardColors(
                containerColor = if (message.isUser) 
                    MaterialTheme.colorScheme.primary 
                else 
                    MaterialTheme.colorScheme.surfaceVariant
            ),
            shape = RoundedCornerShape(
                topStart = 16.dp,
                topEnd = 16.dp,
                bottomStart = if (message.isUser) 16.dp else 4.dp,
                bottomEnd = if (message.isUser) 4.dp else 16.dp
            )
        ) {
            Column(
                modifier = Modifier.padding(12.dp)
            ) {
                Text(
                    text = message.sender,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = if (message.isUser) 
                        MaterialTheme.colorScheme.onPrimary 
                    else 
                        MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(bottom = 4.dp)
                )
                Text(
                    text = message.content,
                    fontSize = 14.sp,
                    color = if (message.isUser) 
                        MaterialTheme.colorScheme.onPrimary 
                    else 
                        MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
