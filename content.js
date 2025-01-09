	//content.js



(function() {
    'use strict';

    // 创建按钮容器
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '180px';
    container.style.right = '1800px'; // 修正位置
    container.style.zIndex = '9999'; // 设置高层级，确保容器在最上层

    // 创建计时输入框
    const input = document.createElement('input');
    input.type = 'number';
    input.value = '17'; // 默认值17秒
    input.style.marginRight = '10px';
    input.style.width = '80px'; // 输入框宽度
    input.style.padding = '5px';
    input.style.zIndex = '9999'; // 保证输入框处于容器的最上层

    // 创建启动/暂停按钮
    const startPauseButton = document.createElement('button');
    startPauseButton.textContent = '启动';
    startPauseButton.style.backgroundColor = '#ffffff';
    startPauseButton.style.padding = '10px 20px';
    startPauseButton.style.borderRadius = '10px';
    startPauseButton.style.cursor = 'pointer';
    startPauseButton.style.zIndex = '9999'; // 保证按钮处于容器的最上层

    // 创建停止按钮
    const stopButton = document.createElement('button');
    stopButton.textContent = '停止';
    stopButton.style.backgroundColor = '#ff4d4d';
    stopButton.style.padding = '10px 20px';
    stopButton.style.borderRadius = '10px';
    stopButton.style.cursor = 'pointer';
    stopButton.style.zIndex = '9999'; // 保证按钮处于容器的最上层
    stopButton.disabled = true;

    // 创建随机巡检按钮
    const randomButton = document.createElement('button');
    randomButton.textContent = '随机时间';
    randomButton.style.backgroundColor = '#ffcc00';
    randomButton.style.padding = '10px 20px';
    randomButton.style.borderRadius = '10px';
    randomButton.style.cursor = 'pointer';
    randomButton.style.zIndex = '9999'; // 保证按钮处于容器的最上层

    // 创建停止随机巡检按钮
    const stopRandomButton = document.createElement('button');
    stopRandomButton.textContent = '停机随机';
    stopRandomButton.style.backgroundColor = '#ff6666';
    stopRandomButton.style.padding = '10px 20px';
    stopRandomButton.style.borderRadius = '10px';
    stopRandomButton.style.cursor = 'pointer';
    stopRandomButton.style.zIndex = '9999';
    stopRandomButton.disabled = true;

    // 创建刷新按钮
    const refreshButton = document.createElement('button');
    refreshButton.textContent = '刷新';
    refreshButton.style.backgroundColor = '#66cc66';
    refreshButton.style.padding = '10px 20px';
    refreshButton.style.borderRadius = '10px';
    refreshButton.style.cursor = 'pointer';
    refreshButton.style.zIndex = '9999'; // 保证按钮处于容器的最上层

    // 将按钮和输入框添加到容器
    container.appendChild(input);
    container.appendChild(startPauseButton);
    container.appendChild(stopButton);
    container.appendChild(randomButton);
    container.appendChild(stopRandomButton);
    container.appendChild(refreshButton);

    // 将容器添加到页面
    document.body.appendChild(container);

    let times = 0; // 记录巡查次数
    let isRunning = false; // 标记巡查是否在运行
    let isPaused = false; // 标记巡查是否暂停
    let currentInterval = null; // 当前的计时器标识   null 是变量的初始值
    let randomInterval = null; // 随机巡检的计时器标识
    let isRandomRunning = false; // 标记随机巡检是否正在进行
    let isRefreshing = false; // 标记刷新功能是否开启
    let lastInspectionMode = null; // 保存上一轮巡检模式（固定时间或随机）

    // 刷新状态控制
    let refreshTimeout = null; // 刷新延时控制

    // 点击启动/暂停按钮后的操作
startPauseButton.addEventListener('click', function() {
  const interval = parseInt(input.value, 10); 
  if (isNaN(interval) || interval <= 0) { 
    alert('请输入一个有效的时间（秒）');
    return; 
  }

  if (isPaused) {
    // 恢复巡查
    isPaused = false;
    startPauseButton.textContent = '暂停';
    performInspection(interval); // 恢复巡查
  } else if (!isRunning) {
    // 启动巡查
    isRunning = true;
    startPauseButton.textContent = '暂停';
    stopButton.disabled = false; // 启用停止按钮
    randomButton.disabled = false; // 启用随机巡检按钮
    lastInspectionMode = 'fixed'; // 记录巡检模式为固定时间
    performInspection(interval); // 使用固定时间启动巡查
  } else {
    // 暂停巡查
    isPaused = true;
    startPauseButton.textContent = '恢复';
    clearInterval(currentInterval); // 停止当前计时
  }
});

// 点击停止按钮后的操作
stopButton.addEventListener('click', function() {
  // 停止时重新开始任务
  times = 0; // 重置巡查次数
  isRunning = false;
  isPaused = false;
  clearInterval(currentInterval);
  clearTimeout(randomInterval); // 停止随机巡检
  stopButton.disabled = true; // 禁用停止按钮
  startPauseButton.textContent = '启动';
  startPauseButton.disabled = false;
  randomButton.disabled = false;
  stopRandomButton.disabled = true; // 停止随机巡检按钮

  // 如果刷新功能已开启，执行刷新操作
  if (isRefreshing) {
    refreshCycle();
  }
});

    // 点击随机巡检按钮后的操作
    randomButton.addEventListener('click', function() {
        randomButton.textContent = '随机中...'; // 修改按钮文本
        stopRandomButton.disabled = false; // 启用停止随机巡检按钮  
        lastInspectionMode = 'random'; // 记录巡检模式为随机
        //if (times >= 50) {
        //    alert('巡查已完成，脚本结束');
         //   stopRandomButton.click(); // 完成后自动停止
         //   return;
        //}

        isRandomRunning = true; // 标记随机巡检正在运行
        performRandomInspection();
    });

    // 点击停止随机巡检按钮后的操作
stopRandomButton.addEventListener('click', function() {
  // 停止时清除定时器
  clearTimeout(randomInterval);
  console.log('停止随机巡检');
  randomButton.textContent = '随机时间'; // 恢复按钮文本
  stopRandomButton.disabled = true; // 禁用停止按钮
  randomButton.disabled = false; // 启用随机巡检按钮
  isRandomRunning = false; // 标记随机巡检已停止
});

    // 刷新功能
    refreshButton.addEventListener('click', function() {
        if (isRefreshing) {
            // 关闭刷新功能
            isRefreshing = false;
            refreshButton.textContent = '刷新';
            clearTimeout(refreshTimeout); // 关闭刷新延时
            return;
        }
        isRefreshing = true;
        refreshButton.textContent = '刷新开启...';
        console.log('刷新开启，等待脚本结束后执行');
    });

    // 刷新循环操作
    function refreshCycle() {
        if (isRefreshing) {
            // 点击换一批按钮
            const changeBatchButton = document.querySelector('#scrollContainer > main > div > div.el-card__body > div.el-card.so-scenes.room-list.is-always-shadow > div.el-card__header > div > div.so-scenes__control > div > button.el-button.el-button--primary.el-button--medium > span');
            if (changeBatchButton) {
                changeBatchButton.click();
                console.log('点击换一批按钮');
            } else {
                console.log('未找到换一批按钮');
            }
			if (changeBatchButton) {
				changeBatchButton.click();
				console.log('点击换一批按钮');

      // 在点击换一批后，等待1秒再执行巡查
			setTimeout(() => {
				console.log('等待 1 秒后开始巡查');
        // 根据上次的巡检模式继续执行
				if (lastInspectionMode === 'random') { // 随机
					randomButton.click();
				} else if (lastInspectionMode === 'fixed') { // 固定
					startPauseButton.click();
				}
				}, 1000); // 延迟1秒
		} else {
			console.log('未找到换一批按钮');

            // 刷新完成后，恢复刷新按钮的状态
            //refreshButton.textContent = '刷新';
            //isRefreshing = false;

            // 根据上次的巡检模式继续执行
            
            }
        }
    }

// 执行固定时间巡查操作
const performInspection = (interval) => {
  const startButtonSelector = `#scrollContainer > main > div > div.el-card__body > div.el-card.so-scenes.room-list.is-always-shadow > div.el-card__body > div:nth-child(${times + 2}) > div.el-badge.room-badge > div > div > div > div:nth-child(2) > button > span`;
  const endButtonSelector = `#scrollContainer > main > div > div.el-card__body > div.el-card.so-scenes.room-list.is-always-shadow > div.el-card__body > div:nth-child(${times + 2}) > section > section > div > div.content-bottom > button > span`;

  const startBtn = document.querySelector(startButtonSelector);
  if (startBtn) {
    startBtn.click();
    console.log(`巡查开始，等待 ${interval} 秒`);

    currentInterval = setTimeout(() => {
      const endBtn = document.querySelector(endButtonSelector);

      if (endBtn) {
        endBtn.click();
        console.log(`巡查结束，等待 5 秒后继续`);
      } else {
        console.log('未找到结束按钮，跳过当前巡查');
      }

      times++; // 增加巡查次数

      // 继续下一轮巡查，间隔 5 秒
      setTimeout(() => performInspection(interval), 5000);
    }, interval * 1000);
  } else {
    console.log('未找到开始按钮');
    stopButton.click(); // 如果找不到开始按钮，停止巡查
  }
};

// 执行随机巡查操作
const performRandomInspection = () => {
  const randomTime = Math.floor(Math.random() * (25 - 15 + 1)) + 15; // 随机时间
  console.log(`开始随机巡检，等待 ${randomTime} 秒`);

  const startButtonSelector = `#scrollContainer > main > div > div.el-card__body > div.el-card.so-scenes.room-list.is-always-shadow > div.el-card__body > div:nth-child(${times + 2}) > div.el-badge.room-badge > div > div > div > div:nth-child(2) > button > span`;
  const endButtonSelector = `#scrollContainer > main > div > div.el-card__body > div.el-card.so-scenes.room-list.is-always-shadow > div.el-card__body > div:nth-child(${times + 2}) > section > section > div > div.content-bottom > button > span`;

  const startBtn = document.querySelector(startButtonSelector);
  if (startBtn) {
    startBtn.click();
    console.log(`巡查开始，等待 ${randomTime} 秒`);

    randomInterval = setTimeout(() => {
      const endBtn = document.querySelector(endButtonSelector);

      if (endBtn) {
        endBtn.click();
        console.log(`巡查结束，等待 5 秒后继续`);
      } else {
        console.log('未找到结束按钮，跳过当前巡查');
      }

      times++; // 增加巡查次数

      // 等待 5 秒后继续随机巡查
      setTimeout(() => {
        if (isRandomRunning) {
          performRandomInspection(); // 如果随机巡检仍在进行，继续巡查
        }
      }, 5000); // 等待 5 秒后继续巡查
    }, randomTime * 1000);
  } else {
    console.log('未找到开始按钮');
	stopButton.click();
  }
};
})();
