#!/usr/bin/env python3
"""
Script build Android APK đơn giản trên Google Colab
Chỉ dùng XML + Java cơ bản, không có thư viện nặng
"""

import os
import subprocess
import shutil
import glob
from pathlib import Path

def run_cmd(cmd, check=True):
    """Chạy command và hiển thị output"""
    print(f"🔧 {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout)
    if result.stderr and check:
        print(result.stderr)
    if check and result.returncode != 0:
        raise Exception(f"❌ Command failed: {cmd}")
    return result

def setup_gradle_simple():
    """Setup Gradle đơn giản"""
    print("⚙️ Setting up Gradle...")

    if not os.path.exists("gradle-8.0"):
        run_cmd("wget -q https://services.gradle.org/distributions/gradle-8.0-bin.zip")
        run_cmd("unzip -q gradle-8.0-bin.zip")

    gradle_home = os.path.abspath("gradle-8.0")
    os.environ['GRADLE_HOME'] = gradle_home
    os.environ['PATH'] = f"{gradle_home}/bin:{os.environ['PATH']}"

    run_cmd(f"{gradle_home}/bin/gradle --version")
    print("✅ Gradle setup completed!")

def main_build_simple(repo_url):
    """Build app Android đơn giản"""
    print("🚀 Build Simple Android App")
    print("=" * 50)

    try:
        # 1. Clone repository
        print("📥 1. Clone repository...")
        run_cmd(f"git clone {repo_url} android-project")
        os.chdir("android-project")

        # 2. Setup Java 17
        print("☕ 2. Setup Java 17...")
        run_cmd("apt-get update -q")
        run_cmd("apt-get install -y openjdk-17-jdk-headless")

        os.environ['JAVA_HOME'] = '/usr/lib/jvm/java-17-openjdk-amd64'
        os.environ['PATH'] = f"/usr/lib/jvm/java-17-openjdk-amd64/bin:{os.environ['PATH']}"

        # 3. Setup Android SDK
        print("📱 3. Setup Android SDK...")
        run_cmd("wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip")
        run_cmd("unzip -q commandlinetools-linux-9477386_latest.zip")
        run_cmd("mkdir -p /content/android-sdk/cmdline-tools")
        run_cmd("mv cmdline-tools /content/android-sdk/cmdline-tools/latest")

        os.environ['ANDROID_HOME'] = '/content/android-sdk'
        os.environ['ANDROID_SDK_ROOT'] = '/content/android-sdk'
        os.environ['PATH'] = f"/content/android-sdk/cmdline-tools/latest/bin:/content/android-sdk/platform-tools:{os.environ['PATH']}"

        # Accept licenses và install SDK
        run_cmd("yes | sdkmanager --licenses", check=False)
        run_cmd("sdkmanager 'platform-tools' 'platforms;android-34' 'build-tools;34.0.0'")

        # 4. Setup Gradle
        setup_gradle_simple()

        # 5. Clean project
        print("🧹 5. Clean project...")
        run_cmd("rm -rf app/build", check=False)
        run_cmd("rm -rf build", check=False)

        # 6. Setup Gradle wrapper
        print("📦 6. Setup Gradle wrapper...")
        run_cmd("chmod +x gradlew")
        gradle_bin = f"{os.environ['GRADLE_HOME']}/bin/gradle"
        run_cmd(f"{gradle_bin} wrapper --gradle-version 8.0")

        # 7. Build APK
        print("🔨 7. Build APK...")
        run_cmd("./gradlew clean")
        run_cmd("./gradlew assembleDebug")

        # 8. Find APK
        print("📱 8. Finalizing APK...")
        apk_files = glob.glob('**/app/build/outputs/apk/**/*.apk', recursive=True)

        if apk_files:
            apk_path = apk_files[0]
            final_apk = '/content/SimpleChatApp.apk'
            shutil.copy(apk_path, final_apk)

            file_size = os.path.getsize(final_apk) / (1024 * 1024)
            print(f"✅ BUILD THÀNH CÔNG!")
            print(f"📱 APK: {apk_path}")
            print(f"📏 Size: {file_size:.2f} MB")

            # Auto download
            try:
                from google.colab import files
                files.download('SimpleChatApp.apk')
                print("📥 APK downloaded!")
            except ImportError:
                print("💡 Download manually: /content/SimpleChatApp.apk")

            return True
        else:
            print("❌ APK not found!")
            return False

    except Exception as e:
        print(f"💥 ERROR: {e}")
        return False

if __name__ == "__main__":
    # Thay repo URL
    REPO_URL = "https://github.com/hoanghai2110-web/demo.git"

    print("🎯 Starting simple build process...")
    success = main_build_simple(REPO_URL)

    if success:
        print("🎉 HOÀN THÀNH! App đơn giản đã build xong!")
    else:
        print("❌ Build failed!")