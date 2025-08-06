let videoElement = null;
let styleElement = null;
let currentSettings = {};
let overlayElement = null; 
let pageTheme = null
// 功能函数：应用样式和视频
function applyEffects(settings, pageTheme) {
  // --- 处理样式 ---
//   console.log(settings)
  if (!styleElement) {
    styleElement = document.createElement('style');
    document.head.appendChild(styleElement);
  }  const backgroundAlpha = 1 - ((settings.video_opacity || 100) / 100);
  const opacity = settings.opacity / 100;
  styleElement.textContent = `
    body > *:not(#video-background):not(style):not(script) {
      opacity: ${opacity} !important;
    }
  `;

  // --- 处理视频 ---
  if (!videoElement) {
    videoElement = document.createElement('video');
    videoElement.id = 'video-background';
    Object.assign(videoElement.style, {
        position: 'fixed',
        top: '0', left: '0',
        width: '100vw',
        height: '100vh',
        objectFit: 'cover',
        backgroundColor: 'black',
        zIndex: '-2147483647',
        pointerEvents: 'none',
      });
    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.muted = true;
    document.body.prepend(videoElement);
  }

  if (!overlayElement) {
    overlayElement = document.createElement('div');
    overlayElement.id = 'video-overlay';
    Object.assign(overlayElement.style, {
        position: 'fixed', top: '0', left: '0',
        width: '100vw', height: '100vh',
        zIndex: '-2147483646', 
        pointerEvents: 'none', 
        transition: 'background-color 0.3s' 
    });
    videoElement.insertAdjacentElement('afterend', overlayElement);
  }
  pageTheme == 'light'?   overlayElement.style.backgroundColor = `rgba(255, 255, 255, ${backgroundAlpha})`:   overlayElement.style.backgroundColor = `rgba(0, 0, 0, ${backgroundAlpha})`;
//   overlayElement.style.backdropFilter = `blur(${backgroundAlpha}px)`;
//   overlayElement.style.webkitBackdropFilter = `blur(${backgroundAlpha}px)`;
  // 决定视频源
  const videoSrc = settings.videoUrl || chrome.runtime.getURL('background.webm');
  if (videoElement.src !== videoSrc) {
    videoElement.src = videoSrc;
  }
}

function getLuminance(rgb) {
    if (!rgb || !rgb.startsWith('rgb')) return 255; // 默认白色
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }
  
  // (因为背景可能是透明的，需要向上追溯)
function findEffectiveBackgroundColor(element) {
    let current = element;
    while (current) {
      const style = window.getComputedStyle(current);
      const bgColor = style.backgroundColor;
      // 如果找到了一个不透明的背景色，就返回它
      if (bgColor && !bgColor.startsWith('rgba(0, 0, 0, 0)')) {
        return bgColor;
      }
      if (current === document.documentElement) {
        break;
      }
      current = current.parentElement;
    }
    return 'rgb(255, 255, 255)'; // 默认背景为白色
  }
  
  // --- 核心函数: 多点采样智能主题检测 ---
  function detectPageTheme() {
    // console.log("--- Starting Heuristic Theme Detection This is video play pulgin logging!   ---");
    let lightThemeVotes = 0;
    let darkThemeVotes = 0;
  
    // 1. 选择页面上最有代表性的文本元素进行采样
    const samples = Array.from(document.querySelectorAll('p, h1, h2, h3, li, span'))
      .filter(el => el.textContent.trim().length > 10) // 只选择有一定文本内容的元素
      .slice(0, 15); // 最多取前15个样本，防止性能问题
    if (samples.length === 0) {
      // console.log("No suitable text samples found. use contrast.");
      return contrast_detectPageTheme()
    }
  
    // 2. 遍历样本，进行“投票”
    for (const el of samples) {
      const style = window.getComputedStyle(el);
      const textColor = style.color;
      const bgColor = findEffectiveBackgroundColor(el);
  
      const lumText = getLuminance(textColor);
      const lumBg = getLuminance(bgColor);
      
      // 如果文字比背景亮，则为深色主题投一票
      if (lumText > lumBg) {
        darkThemeVotes++;
      } else {
        lightThemeVotes++;
      }
    }
  
    // 3. 根据投票结果决定最终主题
    const decision = darkThemeVotes > lightThemeVotes ? 'dark' : 'light';
    // console.log(`Detection complete. Votes - Light: ${lightThemeVotes}, Dark: ${darkThemeVotes}. Decision: ${decision}`);
    return decision;
  }
  
function contrast_detectPageTheme() {
    const style = window.getComputedStyle(document.body);
    const textColor = style.color;
    const bgColor = style.backgroundColor;

    // 如果无法获取到RGB颜色，则默认返回 'light' 作为安全选项
    if (!textColor.startsWith('rgb') || !bgColor.startsWith('rgb')) {
        console.warn("Theme detection failed: Could not read RGB colors. Defaulting to 'light'.");
        return 'light';
    }

    const getLuminance = (rgb) => {
        const [r, g, b] = rgb.match(/\d+/g).map(Number);
        // 标准亮度计算公式，返回 0 (黑) 到 255 (白)
        return 0.299 * r + 0.587 * g + 0.114 * b;
    };

    const lumText = getLuminance(textColor);
    const lumBg = getLuminance(bgColor);

    // 核心判断：
    // 1. 文字亮度 > 背景亮度 -> 深色主题
    // 2. 文字亮度 < 背景亮度 -> 浅色主题
    // 3. 为防止在低对比度页面（如灰底深灰字）上误判，增加一个对比度阈值
    const theme = lumText > lumBg ? 'dark' : 'light';
    // console.log(`Theme detected: ${theme} (Text Lum: ${lumText.toFixed(0)}, BG Lum: ${lumBg.toFixed(0)})`);
    return theme;
}

function removeEffects() {
  if (videoElement) {
      videoElement.pause();
      videoElement.src = ''; 
      videoElement.load(); 
      videoElement.remove();
      videoElement = null;
  }
  if (overlayElement) {
      overlayElement.remove();
      overlayElement = null;
  }
  if (styleElement) {
      styleElement.remove();
      styleElement = null;
  }
}

document.addEventListener('visibilitychange', () => {
    if (!currentSettings.isEnabled) return;
    if (document.hidden) {
        removeEffects();
    } else {
        applyEffects(currentSettings, pageTheme);
    }
  });


chrome.storage.onChanged.addListener((changes, namespace) => {
  handle_change_with_promise().then(result => {
    // console.log('Promise 完成了，结果是: ' + result);
    if (!result) {
      removeEffects();
    }
  });

});

function handle_change_with_promise() {
  return new Promise(resolve => { // 返回一个 Promise 对象
    chrome.storage.sync.get(['isEnabled', 'opacity','video_opacity', 'videoUrl'], (settings) => {
      currentSettings = settings;
      if (settings.isEnabled) {
        if (!pageTheme) {
          pageTheme = detectPageTheme();
        }
        chrome.storage.local.get('videoDataUrl', (video_file) => {
          if (video_file.videoDataUrl){
            currentSettings.videoUrl = video_file.videoDataUrl;
          }
          applyEffects(currentSettings, pageTheme); 
          
          resolve(true); 
        });
      } else {
        resolve(false); 
      }
    });
  });
}

handle_change_with_promise()
