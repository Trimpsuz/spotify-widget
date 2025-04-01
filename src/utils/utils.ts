export const formatTime = (ms: number) => {
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
};

export const getTimer = (ms: number) => {
  const offsetSo = ms % 10000;
  const offsetSt = ms % 60000;
  const offsetMo = ms % 600000;
  const offsetMt = ms % 3600000;

  return `
    <style>
      div#so0 { animation: 10000ms linear infinite ten ${0 * 1000 - offsetSo}ms; }
      div#so1 { animation: 10000ms linear infinite ten ${1 * 1000 - offsetSo}ms; }
      div#so2 { animation: 10000ms linear infinite ten ${2 * 1000 - offsetSo}ms; }
      div#so3 { animation: 10000ms linear infinite ten ${3 * 1000 - offsetSo}ms; }
      div#so4 { animation: 10000ms linear infinite ten ${4 * 1000 - offsetSo}ms; }
      div#so5 { animation: 10000ms linear infinite ten ${5 * 1000 - offsetSo}ms; }
      div#so6 { animation: 10000ms linear infinite ten ${6 * 1000 - offsetSo}ms; }
      div#so7 { animation: 10000ms linear infinite ten ${7 * 1000 - offsetSo}ms; }
      div#so8 { animation: 10000ms linear infinite ten ${8 * 1000 - offsetSo}ms; }
      div#so9 { animation: 10000ms linear infinite ten ${9 * 1000 - offsetSo}ms; }

      div#st0 { animation: 60000ms linear infinite six ${0 * 1000 - offsetSt}ms; }
      div#st1 { animation: 60000ms linear infinite six ${10 * 1000 - offsetSt}ms; }
      div#st2 { animation: 60000ms linear infinite six ${20 * 1000 - offsetSt}ms; }
      div#st3 { animation: 60000ms linear infinite six ${30 * 1000 - offsetSt}ms; }
      div#st4 { animation: 60000ms linear infinite six ${40 * 1000 - offsetSt}ms; }
      div#st5 { animation: 60000ms linear infinite six ${50 * 1000 - offsetSt}ms; }

      div#mo0 { animation: 600000ms linear infinite ten ${0 * 60000 - offsetMo}ms; }
      div#mo1 { animation: 600000ms linear infinite ten ${60 * 1000 - offsetMo}ms; }
      div#mo2 { animation: 600000ms linear infinite ten ${120 * 1000 - offsetMo}ms; }
      div#mo3 { animation: 600000ms linear infinite ten ${180 * 1000 - offsetMo}ms; }
      div#mo4 { animation: 600000ms linear infinite ten ${240 * 1000 - offsetMo}ms; }
      div#mo5 { animation: 600000ms linear infinite ten ${300 * 1000 - offsetMo}ms; }
      div#mo6 { animation: 600000ms linear infinite ten ${360 * 1000 - offsetMo}ms; }
      div#mo7 { animation: 600000ms linear infinite ten ${420 * 1000 - offsetMo}ms; }
      div#mo8 { animation: 600000ms linear infinite ten ${480 * 1000 - offsetMo}ms; }
      div#mo9 { animation: 600000ms linear infinite ten ${540 * 1000 - offsetMo}ms; }

      div#mt0 { animation: 3600000ms linear infinite six ${0 * 60000 - offsetMt}ms; }
      div#mt1 { animation: 3600000ms linear infinite six ${600 * 1000 - offsetMt}ms; }
      div#mt2 { animation: 3600000ms linear infinite six ${1200 * 1000 - offsetMt}ms; }
      div#mt3 { animation: 3600000ms linear infinite six ${1800 * 1000 - offsetMt}ms; }
      div#mt4 { animation: 3600000ms linear infinite six ${2400 * 1000 - offsetMt}ms; }
      div#mt5 { animation: 3600000ms linear infinite six ${3000 * 1000 - offsetMt}ms; }

      @keyframes ten {
        0%, 9.9999% { font-size: 16px; }
        10%, 100% { font-size: 0px; }
      }
      @keyframes six {
        0%, 16.6666% { font-size: 16px; }
        16.6667%, 100% { font-size: 0px; }
      }
    </style>

    <div id="mt0">0</div>
    <div id="mt1">1</div>
    <div id="mt2">2</div>
    <div id="mt3">3</div>
    <div id="mt4">4</div>
    <div id="mt5">5</div>

    <div id="mo0">0</div>
    <div id="mo1">1</div>
    <div id="mo2">2</div>
    <div id="mo3">3</div>
    <div id="mo4">4</div>
    <div id="mo5">5</div>
    <div id="mo6">6</div>
    <div id="mo7">7</div>
    <div id="mo8">8</div>
    <div id="mo9">9</div>

    <div style="font-size: 16px;">:</div>

    <div id="st0">0</div>
    <div id="st1">1</div>
    <div id="st2">2</div>
    <div id="st3">3</div>
    <div id="st4">4</div>
    <div id="st5">5</div>

    <div id="so0">0</div>
    <div id="so1">1</div>
    <div id="so2">2</div>
    <div id="so3">3</div>
    <div id="so4">4</div>
    <div id="so5">5</div>
    <div id="so6">6</div>
    <div id="so7">7</div>
    <div id="so8">8</div>
    <div id="so9">9</div>
  `;
};
