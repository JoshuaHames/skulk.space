function switchElementColors(element, index, array, elements) {
    setTimeout(function() {
        element.classList.add('skulk-link-animate')
    }, 15 * index);
}

function stopElementColors(element, index, array, elements) {
    setTimeout(function() {
        element.classList.remove('skulk-link-animate')
    },  25 * index);
}

function TokenizeLink(element){
    let letters = element.innerHTML
    let newInner =""
    let tag = ""
    let text = ""
    let inTag = false
    let justText = true
    let rawtag = false
    if(!letters.trim().length){
        rawtag = true
    }

    for(var i = 0; i<letters.length; i++){
        if(letters[i] === '<'){

            newInner = newInner + text

            text = ""
            inTag = true
            justText = false
        } else if (letters[i] === '>'){
            tag = tag + letters[i]
            newInner = newInner + tag
            tag = ""
            inTag = false
        }

        if(inTag){
            tag = tag + letters[i]
            if (tag.includes("<style") || tag.includes("<script")){
                rawtag = true
            } else if (tag.includes("</style") || tag.includes("</script")){
                rawtag = false
            }
        } else if (!inTag) {
            if(rawtag === false){
                if(letters[i] != '' && letters[i] != '>' && letters[i] != '<' && letters[i] != '\n'&& letters[i] != '\t' && letters[i] != '\r'){
                    text = text + '<span style="display:inline;">' + letters[i] + '</span>'
                }
            } else if(rawtag === true){
                text = text + letters[i]
            }
        }

     }
     if(justText === true){
        newInner = text
     }

     element.innerHTML= newInner
}

function StartAnimateLink(mouseevent){
    letterElements = mouseevent.toElement.getElementsByTagName("span")
    Array.from(letterElements).forEach(
        function(element, index, array){
            switchElementColors(element, index, array, letterElements)
        }
    )
}

function StopAnimateLink(mouseevent){
    letterElements = mouseevent.fromElement.getElementsByTagName("span")
    Array.from(letterElements).forEach(
        function(element, index, array){
            stopElementColors(element, index, array, letterElements)
        }
    )
}