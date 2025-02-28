//OP_bgAnimate Handling

function set_OP_bgAnimate(enabled){
    localStorage.setItem("bgAnimate", enabled)
}

if (localStorage.getItem("bgAnimate") = null){
    set_OP_bgAnimate(1)
}

function set_OP_linkAnimate(enabled){
    localStorage.setItem("linkAnimate", enabled)
}

if (localStorage.getItem("linkAnimate") = null){
    set_OP_linkAnimate(1)
}

function set_OP_pageParsed(enabled){
    localStorage.setItem("pageParsed", enabled)
}

if (localStorage.getItem("pageParsed") = null){
    set_OP_pageParsed(0)
}




