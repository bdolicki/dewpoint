(function(){
  const svg = document.getElementById('chart');
  const ns = 'http://www.w3.org/2000/svg';
  const margin = {top:20, right:80, bottom:50, left:60}; // Updated margins
  let width, height;
  let temperature = 20; // initial T
  const minDp = -50;
  const maxDp = 50;
  let pointerActive = false;
  let touchStartY = null;

  function dewpoint(T,RH){
    const a=17.27, b=237.7;
    const alpha=((a*T)/(b+T))+Math.log(RH/100);
    return (b*alpha)/(a-alpha);
  }

  function resize(){
    width = svg.clientWidth;
    height = svg.clientHeight;
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    drawAxes();
    drawCurve();
  }

  function xScale(rh){
    return margin.left + (rh/100)*(width - margin.left - margin.right);
  }

  function yScale(dp){
    return margin.top + (maxDp - dp)/(maxDp - minDp)*(height - margin.top - margin.bottom);
  }

  function drawAxes(){
    const xAxis = document.createElementNS(ns,'g');
    xAxis.setAttribute('class','axis');
    const y0 = height - margin.bottom;
    const x0 = margin.left;
    const x1 = width - margin.right;
    const path = document.createElementNS(ns,'path');
    path.setAttribute('d',`M${x0},${y0}L${x1},${y0}`);
    path.setAttribute('fill','none');
    path.setAttribute('stroke','#444');
    xAxis.appendChild(path);
    for(let i=0;i<=10;i++){
      const x = xScale(i*10);
      const tick = document.createElementNS(ns,'line');
      tick.setAttribute('x1',x); tick.setAttribute('x2',x);
      tick.setAttribute('y1',y0); tick.setAttribute('y2',y0+5);
      tick.setAttribute('stroke','#444');
      xAxis.appendChild(tick);
      const text = document.createElementNS(ns,'text');
      text.setAttribute('x',x); text.setAttribute('y',y0+20); // Adjusted y position
      text.setAttribute('text-anchor','middle');
      text.setAttribute('class','label');
      text.textContent=i*10;
      xAxis.appendChild(text);
    }
    svg.appendChild(xAxis);
    const xlabel=document.createElementNS(ns,'text');
    xlabel.setAttribute('x',(x0+x1)/2);
    xlabel.setAttribute('y',height-10); // Adjusted y position
    xlabel.setAttribute('text-anchor','middle');
    xlabel.setAttribute('class','label');
    xlabel.textContent='Relative Humidity (%)';
    svg.appendChild(xlabel);

    const yAxis=document.createElementNS(ns,'g');
    yAxis.setAttribute('class','axis');
    const yPath=document.createElementNS(ns,'path');
    yPath.setAttribute('d',`M${x0},${margin.top}L${x0},${y0}`);
    yPath.setAttribute('fill','none');
    yPath.setAttribute('stroke','#444');
    yAxis.appendChild(yPath);
    for(let i=-40;i<=40;i+=10){
      const y=yScale(i);
      const tick=document.createElementNS(ns,'line');
      tick.setAttribute('x1',x0-5); tick.setAttribute('x2',x0);
      tick.setAttribute('y1',y); tick.setAttribute('y2',y);
      tick.setAttribute('stroke','#444');
      yAxis.appendChild(tick);
      const text=document.createElementNS(ns,'text');
      text.setAttribute('x',x0-10); text.setAttribute('y',y+4); // Adjusted x position
      text.setAttribute('text-anchor','end');
      text.setAttribute('class','label');
      text.textContent=i;
      yAxis.appendChild(text);
    }
    svg.appendChild(yAxis);

    const ylabel=document.createElementNS(ns,'text');
    // Adjusted x in transform and direct x attribute
    ylabel.setAttribute('transform',`rotate(-90 ${margin.left/3} ${(margin.top+y0)/2})`);
    ylabel.setAttribute('text-anchor','middle');
    ylabel.setAttribute('class','label');
    ylabel.setAttribute('x', margin.left / 3); // Adjusted x position (e.g., 20 if margin.left is 60)
    ylabel.setAttribute('y',(margin.top+y0)/2);
    ylabel.textContent='Dewpoint (°C)';
    svg.appendChild(ylabel);
  }

  let curvePath, tempText, pointerLine, xValueText, yValueText;

  function drawCurve(){
    const points=[];
    for(let rh=1; rh<=100; rh+=1){
      const dp=dewpoint(temperature,rh);
      points.push([xScale(rh), yScale(dp)]);
    }
    const d = points.map((p,i)=> (i===0?`M${p[0]},${p[1]}`:`L${p[0]},${p[1]}`)).join(' ');
    curvePath=document.createElementNS(ns,'path');
    curvePath.setAttribute('d',d);
    curvePath.setAttribute('class','curve');
    svg.appendChild(curvePath);

    const x = xScale(100);
    const y = yScale(dewpoint(temperature,100));
    tempText=document.createElementNS(ns,'text');
    tempText.setAttribute('x',x+8); // Adjusted x position
    tempText.setAttribute('y',y-8); // Adjusted y position
    tempText.setAttribute('class','indicator');
    tempText.textContent=`${temperature} °C`;
    svg.appendChild(tempText);

    pointerLine=document.createElementNS(ns,'line');
    pointerLine.setAttribute('class', 'pointer-line'); // Assign class
    pointerLine.setAttribute('stroke','red'); // Keep existing stroke color, can be moved to CSS if preferred
    pointerLine.setAttribute('y1',margin.top);
    pointerLine.setAttribute('y2',height-margin.bottom);
    // Initial visibility is now handled by CSS (.pointer-line default)
    svg.appendChild(pointerLine);

    xValueText=document.createElementNS(ns,'text');
    xValueText.setAttribute('class','label value-label x-value-label'); // Assign classes
    xValueText.setAttribute('text-anchor','middle');
    xValueText.setAttribute('y',height-margin.bottom-10); // Adjusted y position
    // Initial visibility is now handled by CSS (.value-label default)
    svg.appendChild(xValueText);

    yValueText=document.createElementNS(ns,'text');
    yValueText.setAttribute('class','label value-label y-value-label'); // Assign classes
    yValueText.setAttribute('text-anchor','start');
    yValueText.setAttribute('x',margin.left+10); // Adjusted x position
    // Initial visibility is now handled by CSS (.value-label default)
    svg.appendChild(yValueText);
  }

  function updateCurve(){
    const points=[];
    for(let rh=1; rh<=100; rh+=1){
      const dp=dewpoint(temperature,rh);
      points.push([xScale(rh), yScale(dp)]);
    }
    const d = points.map((p,i)=> (i===0?`M${p[0]},${p[1]}`:`L${p[0]},${p[1]}`)).join(' ');
    curvePath.setAttribute('d',d);
    const x=xScale(100);
    const y=yScale(dewpoint(temperature,100));
    tempText.setAttribute('x',x+8); // Adjusted x position
    tempText.setAttribute('y',y-8); // Adjusted y position
    tempText.textContent=`${temperature} °C`;
  }

  function pointerMove(posX){
    const rh = Math.min(100, Math.max(1, (posX - margin.left)/(width - margin.left - margin.right)*100));
    const dp = dewpoint(temperature, rh);
    const x = xScale(rh);
    const y = yScale(dp);
    pointerLine.setAttribute('x1',x);
    pointerLine.setAttribute('x2',x);
    pointerLine.classList.add('visible');
    pointerLine.style.visibility = 'visible';

    xValueText.setAttribute('x',x);
    xValueText.textContent=rh.toFixed(1)+'%';
    xValueText.classList.add('visible');
    xValueText.style.visibility = 'visible';

    yValueText.setAttribute('y',y+4);
    yValueText.textContent=dp.toFixed(1)+'°C';
    yValueText.classList.add('visible');
    yValueText.style.visibility = 'visible';
  }

  function hidePointer(){
    pointerLine.classList.remove('visible');
    xValueText.classList.remove('visible');
    yValueText.classList.remove('visible');

    setTimeout(() => {
      if (!pointerLine.classList.contains('visible')) pointerLine.style.visibility = 'hidden';
      if (!xValueText.classList.contains('visible')) xValueText.style.visibility = 'hidden';
      if (!yValueText.classList.contains('visible')) yValueText.style.visibility = 'hidden';
    }, 200); // Match transition duration in CSS
  }

  svg.addEventListener('mousemove',e=>{
    pointerActive=true;
    pointerMove(e.offsetX);
  });
  svg.addEventListener('mouseleave',e=>{
    pointerActive=false;
    hidePointer();
  });

  svg.addEventListener('touchstart',e=>{
    pointerActive=true;
    const touch=e.touches[0];
    pointerMove(touch.clientX - svg.getBoundingClientRect().left);
    touchStartY=touch.clientY;
  });
  svg.addEventListener('touchmove',e=>{
    const rect=svg.getBoundingClientRect();
    const touch=e.touches[0];
    pointerMove(touch.clientX - rect.left);
    if(touchStartY!==null){
      const dy=touchStartY-touch.clientY;
      if(Math.abs(dy)>30){
        changeTemp(dy>0?1:-1);
        touchStartY=touch.clientY;
      }
    }
    e.preventDefault();
  },{passive:false});
  svg.addEventListener('touchend',e=>{
    hidePointer();
    pointerActive=false;
    touchStartY=null;
  });

  svg.addEventListener('wheel',e=>{
    changeTemp(e.deltaY<0?1:-1);
    if(!pointerActive) hidePointer();
    e.preventDefault();
  });

  function changeTemp(delta){
    temperature = Math.max(-40, Math.min(50, temperature + delta));
    updateCurve();
  }

  window.addEventListener('resize', resize);
  resize();
})();
