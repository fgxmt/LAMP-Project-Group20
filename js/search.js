//Search Function 
function doSearch() {
    const resultA = document.getElementById("resultsA");
    const userText = document.getElementById("sBar").value.trim();

    if (!userText) {
        resultA.innerHTML = "<p>Please Enter Name Above</p>";
        return;
    }

    resultA.innerHTML = "";

    //Populating with temp data to show search works properly
    const temp = ["Fire", "Truck", "Fire Truck", "FireTruck", "Fire-Truck", "Freddy", "Pizza"];
    const temp2 = temp.filter(name => name.toLowerCase().includes(userText.toLowerCase()));

    if (temp2.length === 0) {
        resultA.innerHTML = "<p>No contacts found</p>";
        return;
    }

    temp2.forEach(name => {
        const temp3 = document.createElement("div");
        temp3.textContent = name;
        resultA.appendChild(temp3);
        const lineEle = document.createElement("hr");
        resultA.appendChild(lineEle);
    });
}

//Search Button Code
document.addEventListener("DOMContentLoaded", function() {
    const searchB = document.getElementById("sButton");
    if (searchB) {
        searchB.addEventListener("click", doSearch);
    }
});
