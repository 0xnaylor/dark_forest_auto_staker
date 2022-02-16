async function main() {
    
    // in milliseconds
    const stakingPeriod = 1000 * 3;

    const intervalObj = setInterval(() => {
        print();
    }, stakingPeriod);
      
    // can have a button that actives this.
    // clearInterval(intervalObj);
    
    function print() {
        let date = new Date();
        console.log(date); 
    }
}

main();


