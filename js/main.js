let query = {
    category:       'loops',
    keys:           '',
    order:          ['date', 'd'],
    tempo:          [0,200],
    page:           1,
    key:            ['c', ''],
    date:           0,
    filterByKey:    false
};

var pref = {
    tempoRange: true,
    contentDir: "/home/ari/looperman/",
    appendContent: false,
    direction: "d"
}

var tempoSlider = new rSlider({
    target: '#tempo-range',
    values: {min: 0, max: 200},
    step: 1,
    range: pref.tempoRange,
    tooltip: true,
    scale: false,
    labels: false,
    set: [0, 200]
});

search();
feather.replace();

document.querySelector("#direction-toggle").firstElementChild.style.display = "none";

function toggleTempoSliderMode(){
    let min = [parseInt(tempoSlider.getValue().split(/[ ,]+/)[0]), 200];
    
    pref.tempoRange = !pref.tempoRange;

    document.getElementById("tempo-mode-toggle").innerHTML = pref.tempoRange ? "BPM Range" : "Single BPM"

    tempoSlider.destroy();
    tempoSlider = new rSlider({
        target: '#tempo-range',
        values: {min: 0, max: 200},
        step: 1,
        range: pref.tempoRange,
        tooltip: true,
        scale: false,
        labels: false,
        set: min
    });
}

function toggleKeyMode(){
    query.key[1] = (query.key[1] == "m") ? "" : "m";
    document.getElementById("key-mode-toggle").innerHTML = (query.key[1] == "m") ? "Minor Key" : "Major Key";
}

function toggleDirection(){
    if(pref.direction == "d"){
        pref.direction = "a";
        document.querySelector("#direction-toggle .feather-chevrons-down").style.display = "none";
        document.querySelector("#direction-toggle .feather-chevrons-up").style.display = "inline";
    } else {
        pref.direction = "d";
        document.querySelector("#direction-toggle .feather-chevrons-down").style.display = "inline";
        document.querySelector("#direction-toggle .feather-chevrons-up").style.display = "none";
    }
}

function appendResults(results){
    resultsContainer = document.querySelector("#results-contents");
    results.forEach(result => {
        console.log(result.author);
        html = "<div class='audio-result'><div class='fg-layer'><div class='info'><img src='"+result.profile_pic+"' class='profile_picture_sample'><div class='sample-info-txt'><div class='sample-title'>"+result.title+"</div><div class='sample-author'>"+result.author+" - "+result.tempo+" - Key: "+result.key+"</div></div></div><div class='actions'>"+feather.icons["download-cloud"].toSvg()+feather.icons["more-vertical"].toSvg()+"</div></div><div class='bg-layer'><img src='"+result.waveform+"' class='bg-waveform'></div></div>";
        resultsContainer.innerHTML += html;
    });
}

function search(){
    resultsContainer = document.querySelector("#results-contents");
    resultsContainer.innerHTML = '<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>';

    let min = parseInt(tempoSlider.getValue().split(/[ ,]+/)[0]);
    let max = pref.tempoRange ? parseInt(tempoSlider.getValue().split(/[ ,]+/)[1]) : min;
    console.log([min,max]);

    query.keys = document.querySelector("#filter-search").value;
    query.tempo = [min,max];
    query.page = 1;
    query.order[0] = document.querySelector("#order").value;
    query.order[1] = pref.direction;
    query.date = document.querySelector("#date").value;

    ipcRenderer.invoke('search', query).then((results) => {
        resultsContainer.innerHTML = '';
        appendResults(results);
    });
}

function loadNewContent(){
    query.page += 1;

    ipcRenderer.invoke('search', query).then((results) => {
        resultsContainer.lastChild.remove();
        appendResults(results);
        pref.appendContent = false;
    });
}

function selectkey(key){
    document.querySelectorAll("#keys .key").forEach((el)=>{
        if(el.classList.contains("selected")) el.classList.remove("selected");
    });

    if(query.filterByKey && query.key[0] == key){
        document.querySelector('#keys #'+key).classList.remove("selected");
        query.filterByKey = false;
    } else {
        document.querySelector('#keys #'+key).classList.add("selected");
        query.filterByKey = true;
    }

    query.key[0] = key;
}

var r = document.querySelector("#results");

r.onscroll = function(ev) {
    resultsContainer = document.querySelector("#results-contents");
    if (Math.ceil(r.scrollTop + r.clientHeight) >= r.scrollHeight - 200
    && !resultsContainer.lastChild.classList.contains("lds-ellipsis")) {
        resultsContainer.innerHTML += '<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>';
        if(!pref.appendContent){
            pref.appendContent = true;
            loadNewContent();
        }
    }
};