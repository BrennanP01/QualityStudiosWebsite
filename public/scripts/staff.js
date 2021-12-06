function updateResults() {
    let searchItem = document.getElementById('search').value
    let children = document.getElementById('staffpage').children; //get container element children.
    if (searchItem == ''){
        for (var i = 0, len = children.length ; i < len; i++) {
            children[i].style.display = "inline-block"
            children[i].style.visibility = 'visible'    
        }
    }else{
        console.log(searchItem)
        for (var i = 0, len = children.length ; i < len; i++) {
            let name = children[i].id
            if (name.slice(0, searchItem.length).toLowerCase() == searchItem.toLowerCase()){
                children[i].style.display = 'inline-block'
                children[i].style.visibility = 'visible'  
            }else {
                children[i].style.display = 'none'
                children[i].style.visibility = 'hidden'
            }
        }
    }
    return false//Prevent refresh
}