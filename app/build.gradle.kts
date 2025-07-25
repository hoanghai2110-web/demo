plugins {
    id("com.android.application")
}

android {
    namespace = "com.example.localllmchat"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.localllmchat"
        minSdk = 21
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
}

dependencies {
    // Theme AppCompat dùng đúng thư viện này là đủ
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0") // Optional: Nếu xài Button, TextInputLayout hiện đại
}