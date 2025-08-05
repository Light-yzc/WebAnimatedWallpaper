document.addEventListener('DOMContentLoaded', () => {
    const masterSwitch = document.getElementById('masterSwitch');
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityValue = document.getElementById('opacityValue');
    const Video_opacitySlider = document.getElementById('Video_opacitySlider');
    const Video_opacityValue = document.getElementById('Video_opacityValue');
    const videoUrlInput = document.getElementById('videoUrlInput');
    const saveButton = document.getElementById('saveButton');
    const imgSwitch = document.getElementById('imgSwitch');
    // 1. 初始化：打开popup时，从storage加载并显示当前设置
    chrome.storage.sync.get(['isEnabled', 'opacity', 'img_isEnabled', 'video_opacity', 'videoUrl'], (result) => {
      masterSwitch.checked = !!result.isEnabled;
      imgSwitch.checked = !!result.img_isEnabled;
      opacitySlider.value = result.opacity || 80;
      opacityValue.textContent = `${opacitySlider.value}%`;
      Video_opacitySlider.value = result.video_opacity || 10;
      Video_opacityValue.textContent = `${Video_opacitySlider.value}%`;
      videoUrlInput.value = result.videoUrl || '';
    });
  
    // 2. 监听事件：当用户操作控件时，保存新设置到storage
    masterSwitch.addEventListener('change', () => {
      chrome.storage.sync.set({ isEnabled: masterSwitch.checked });
    });
    imgSwitch.addEventListener('change', () => {
        console.log('已经保存')
        chrome.storage.sync.set({ img_isEnabled: imgSwitch.checked });
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
      chrome.storage.sync.set({ videoUrl: videoUrlInput.value });
      saveButton.textContent = "已保存!";
      setTimeout(() => { saveButton.textContent = "保存"; }, 1000);
    });

  });