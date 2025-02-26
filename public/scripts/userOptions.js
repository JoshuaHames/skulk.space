//OP_bgAnimate Handling

function set_OP_bgAnimate(enabled){
    localStorage.setItem("bgAnimate", enabled)
}

if (localStorage.getItem("bgAnimate") == null){
    set_OP_bgAnimate(1)
}




