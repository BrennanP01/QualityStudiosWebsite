function updateResults() {    
    let searchItem = document.getElementById('search').value
    let checks = [document.getElementById('barber'), document.getElementById('lash technician'), document.getElementById('other')]
    let rows = document.getElementById('schedule').rows //get container element rows from tbody.
    let state = true
    let e, name, col_class
    checks.forEach( e => {
        if (!e.checked) {
            state = false
        }
    })
    if (searchItem == '' && state == true) {
        for (let i = 0, len = rows.length ; i < len; i++) {     
            e = rows[i]
            e[i].style.display = ''  
        }
    }else{
        for (let i = 0, len = rows.length ; i < len; i++) { //Reminder: html collections don't have forEach()
            e = rows[i]
            name = e.id
            if (name != 'header') {
                col_class = e.cells[0].className
                console.log(col_class)
                if (name.slice(0, searchItem.length).toLowerCase() == searchItem.toLowerCase() && document.getElementById(col_class).checked) {
                    e.style.display = '' 
                }else if (document.getElementById(col_class).checked && searchItem == '') {
                    e.style.display = '' 
                } else {
                    e.style.display = 'none'
                }
            }
        }
    }
    return false//Prevent refresh
}
