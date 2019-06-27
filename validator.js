var Velocity = require('velocityjs');

const successAlert = document.getElementById("successAlert");
const failAlert = document.getElementById("failAlert");
const errorField = document.getElementById("errorField");
let mostRecentlyToggled = null;
const load = () => {
  document.getElementById("submit").addEventListener("click", () => {
    if (mostRecentlyToggled) {
      mostRecentlyToggled.classList.add("collapse");
    }
    errorField.innerHTML = '';
    const text = document.getElementById("inputField").value;
    try {
      const ast = Velocity.parse(text);
      successAlert.classList.remove("collapse");
      mostRecentlyToggled = successAlert;
    } catch (error) {
      console.log(error);
      failAlert.classList.remove("collapse");
      errorField.innerHTML = error.toString().replace(/\n/g, "<br />");;
      mostRecentlyToggled = failAlert;
    }
  });
}
window.onload = load;
