import "../styles/help.css"

const Help = () => {


    function myFunction() {
        console.log("Hi")
        var popup = document.getElementById("myPopup");
        popup.classList.toggle("show");
    }

    const func = (variable) => {
        console.log("Hi")
        var popup = document.getElementById("myPopup");
        popup.classList.toggle("show");
    }

    // JSX not HTML
    return (
        <div class="popup" onClick={() => {myFunction()}}>Click me!
            <span class="popuptext" id="myPopup">Popup text...</span>
        </div>
    );
}

export default Help;
