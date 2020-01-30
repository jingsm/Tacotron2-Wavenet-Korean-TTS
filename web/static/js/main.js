﻿var sw;
var wavesurfer;

// var defaultSpeed = 0.03;
var defaultSpeed = 0.05;
var defaultAmplitude = 0.3;

var activeColors = [[32,133,252], [94,252,169], [253,71,103]];
var inactiveColors = [[241,243,245], [206,212,218], [222,226,230], [173,181,189]];

function generate(ip, port, text, speaker_id) {
  $("#synthesize").addClass("is-loading");

  // var uri = 'http://' + ip + ':' + port
  var uri = 'http://' + window.location.host;
  var url = uri + '/generate?text=' + encodeURIComponent(text) + "&speaker_id=" + speaker_id;

  fetch(url, {cache: 'no-cache', mode: 'cors'})
    .then(function(res) {

      if (!res.ok) throw Error(response.statusText)
      return res.blob()

    }).then(function(blob) {

      console.log(blob.type);
      console.log(blob.size);

      var url = URL.createObjectURL(blob);
      console.log(url);
      inProgress = false;

      $("#waveform").show();
      $("#playbutton").show();

      wavesurfer.load(url);
      $("#synthesize").removeClass("is-loading");

    }).catch(function(err) {

      showWarning("에러가 발생했습니다");
      inProgress = false;
      $("#synthesize").removeClass("is-loading");

    });
}

(function(window, document, undefined){
  window.onload = init;

  function setDefaultColor(sw, isActive) {
    for (idx=0; idx < sw.curves.length; idx++) {
      var curve = sw.curves[idx];

      if (isActive) {
        curve.color = activeColors[idx % activeColors.length];
      } else {
        curve.color = inactiveColors[idx % inactiveColors.length];
      }
    }
  }

  function init(){
    sw = new SiriWave9({
      amplitude: defaultAmplitude,
      container: document.getElementById('wave'),
      autostart: true,
      speed: defaultSpeed,
      style: 'ios9',
    });
    sw.setSpeed(defaultSpeed);
    setDefaultColor(sw, false);

    // wavesurfer = WaveSurfer.create({
    //   container: '#waveform',
    //   waveColor: 'violet',
    //   barWidth: 3,
    //   progressColor: 'purple'
    // });

    wavesurfer = WaveSurfer.create({
      container: '#waveform',
      backend: 'MediaElement',
      mediaType:'audio',
      normalize: true,
      mediaControls: true
    });

    wavesurfer.on('ready', function () {
      this.width = wavesurfer.getDuration() *
                   wavesurfer.params.minPxPerSec * wavesurfer.params.pixelRatio;
      this.peaks = wavesurfer.backend.getPeaks(width);

      wavesurfer.play();
    });

    wavesurfer.on('audioprocess', function () {
      var percent = wavesurfer.backend.getPlayedPercents();
      var height = this.peaks[parseInt(this.peaks.length * percent)];
      if (height > 0) {
        sw.setAmplitude(height*3);
      }
    });

    wavesurfer.on('finish', function () {
      sw.setSpeed(defaultSpeed);
      sw.setAmplitude(defaultAmplitude);
      setDefaultColor(sw, false);
    });

    $(document)
      .on('click', "#synthesize", function() {
        synthesize();
      });

    document
      .querySelector('[data-action="play"]')
      .addEventListener('click', wavesurfer.playPause.bind(wavesurfer));

    function synthesize() {
      var text = $("#text").val().trim();
      var text_length = text.length;

      var speaker_id = $('input[name=id]:checked').val();
      var speaker = $('input[name=id]:checked').attr("speaker");

      generate('0.0.0.0', 51000, text, speaker_id);

      // var lowpass = wavesurfer.backend.ac.createGain();
      // wavesurfer.backend.setFilter(lowpass);
    }
  }
})(window, document, undefined);
