function showAlert()
{
    alert(
        "SIAPA BELAKANG KAU?"
    );
}

function displayDate()
{
    var today = new Date();

    document.getElementById("dateArea").innerHTML =
        today.toDateString();
}

