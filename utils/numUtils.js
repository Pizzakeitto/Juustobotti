exports.numberWithCommas = (x) => numberWithCommas(x)
exports.numberWithSpaces = (x) => numberWithSpaces(x)

function numberWithCommas(x) {
    try {return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
    catch(error) {
        console.error("Failed formatting the number for some reason lol")
        return x
    }
}

function numberWithSpaces(x) {
    try {return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
    catch(error) {
        console.error("Failed formatting the number for some reason lol")
        return x
    }
}