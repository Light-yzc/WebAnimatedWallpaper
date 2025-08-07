document.addEventListener('DOMContentLoaded', () => {
    const masterSwitch = document.getElementById('masterSwitch');
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityValue = document.getElementById('opacityValue');
    const Video_opacitySlider = document.getElementById('Video_opacitySlider');
    const Video_opacityValue = document.getElementById('Video_opacityValue');
    const videoUrlInput = document.getElementById('videoUrlInput');
    const saveButton = document.getElementById('saveButton');
    const bgSwitch = document.getElementById('bgSwitch');
    const videoUpload = document.getElementById('video-upload');
    const fileNameDisplay = document.getElementById('file-name-display');
    const FIVE_MEGABYTES = 5 * 1024 * 1024; // 定义5MB的大小（单位：字节）
    

    // 1. 初始化：打开popup时，从storage加载并显示当前设置
    chrome.storage.sync.get(['isEnabled', 'opacity', 'img_isEnabled', 'bg_isEnabled', 'video_opacity', 'videoUrl'], (result) => {
      console.log('?????' + result)
      masterSwitch.checked = !!result.isEnabled;
      bgSwitch.checked = !!result.bg_isEnabled;
      if (!result.opacity){
        opacitySlider.value = 15;
        chrome.storage.sync.set({ opacity: 15 });
      }
      else{
        opacitySlider.value = result.opacity
      }
      
      opacityValue.textContent = `${opacitySlider.value}%`;

      if (!result.video_opacity){
        Video_opacitySlider.value = 15;
        chrome.storage.sync.set({ video_opacity: 15 });
      }
      else{
        Video_opacitySlider.value = result.video_opacity
      }
      
      Video_opacityValue.textContent = `${Video_opacitySlider.value}%`;
      videoUrlInput.value = result.videoUrl || '';
      display_info(fileNameDisplay);
    });

    // 2. 监听事件：当用户操作控件时，保存新设置到storage
    masterSwitch.addEventListener('change', () => {
      chrome.storage.sync.set({ isEnabled: masterSwitch.checked });
    });


    bgSwitch.addEventListener('change', () => {
        chrome.storage.sync.set({ bg_isEnabled: bgSwitch.checked });
      });

    opacitySlider.addEventListener('input', () => {
      opacityValue.textContent = `${opacitySlider.value}%`;
    });
    
    opacitySlider.addEventListener('change', () => {
      chrome.storage.sync.set({ opacity: opacitySlider.value });
    });
    Video_opacitySlider.addEventListener('input', () => {
        Video_opacityValue.textContent = `${Video_opacitySlider.value}%`;
      });
      
    Video_opacitySlider.addEventListener('change', () => {
        chrome.storage.sync.set({ video_opacity: Video_opacitySlider.value });
    });
    
    saveButton.addEventListener('click', () => {
      if (!videoUrlInput.value) chrome.storage.local.set({'videoDataUrl': null})
      chrome.storage.sync.set({ videoUrl: videoUrlInput.value });
      saveButton.textContent = "已保存!";
      display_info(fileNameDisplay);
      setTimeout(() => { saveButton.textContent = "保存"; }, 1000);
    });

    videoUpload.addEventListener('change', (event) => {
      const file = event.target.files[0];
  
      if (!file) {
          return;
      }
  
      if (file.size > FIVE_MEGABYTES) {
          // alert('错误：文件大小不能超过 5MB！');
          videoUpload.value = ''; 
          fileNameDisplay.textContent = '错误：文件大小不能超过 5MB！';
          fileNameDisplay.style.color = '#ff6b6b';
          return;
      }
  
      fileNameDisplay.textContent = file.name;
      fileNameDisplay.style.color = 'var(--text-color-secondary)'; 
  
      const reader = new FileReader();
      reader.onload = (e) => {
          const videoDataUrl = e.target.result;
          
          // 将 Data URL 存入 chrome.storage.local
          chrome.storage.local.set({ 'videoDataUrl': videoDataUrl, 'filename':file.name }, () => {
              console.log('用户视频已保存！');
              fileNameDisplay.textContent = `${file.name}上传并保存成功！`;
              fileNameDisplay.style.color = 'var(--success-color)'; 
          });
      };
      
      reader.onerror = (error) => {
          console.error('文件读取错误: ', error);
          // alert('读取文件时发生错误。');
          fileNameDisplay.textContent = '读取失败！';
          fileNameDisplay.style.color = '#ff6b6b';
      };
  
      reader.readAsDataURL(file);
  });
  });

    function display_info(fileNameDisplay){
      chrome.storage.local.get(['videoDataUrl', 'filename'], (result) => {
        console.log('//////////////' + result.videoUrl)
        if(result.videoUrl) {
          fileNameDisplay.textContent = `读取到${result.filename}，正在播放`
          fileNameDisplay.style.color = 'var(--success-color)'}
        else{
          fileNameDisplay.textContent = ''
        }
    });
  }