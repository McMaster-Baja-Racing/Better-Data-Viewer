import "../styles/help.css"

const Help = () => {


    function myFunction() {
        var popup = document.getElementById("myPopup");
        popup.classList.toggle("show");
    }

    // HI
    


    return (
        <div class="popup" onclick="myFunction()">Click me!
            <span class="popuptext" id="myPopup">Popup text...</span>
        </div>
    );
}

export default Help;
