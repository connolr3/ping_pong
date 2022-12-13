function red() {
    window.localStorage.setItem('user_colour', "red");
    window.localStorage.setItem('com_colour', "blue");
    //  window.location.href = "pong.html";
};

function submit() {

    let user_preferences = $('form').serializeArray();
    let colour = user_preferences[1].value;
    let level = user_preferences[0].value;
    window.localStorage.setItem('user_colour', "blue");
    window.localStorage.setItem('com_colour', "red");
    if (JSON.stringify(colour) == JSON.stringify("red")) {
        red();
    }


    window.localStorage.setItem('level', level);
    window.location.href = "pong.html"; // GO TO PONG.HTML
}

$(document).ready(function() {
    document.getElementById("submit").addEventListener("click", submit);
});