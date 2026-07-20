var contactForm = document.getElementById("contactForm");

if (contactForm) {
  var nameInput = document.getElementById("nameInput");
  var emailInput = document.getElementById("emailInput");
  var phoneInput = document.getElementById("phoneInput");
  var addressInput = document.getElementById("addressInput");
  var messageInput = document.getElementById("messageInput");
  var successAlert = document.getElementById("formSuccessAlert");

  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var phonePattern = /^[0-9+\-\s]{7,15}$/;

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var isValid = true;

    if (nameInput.value.trim() === "") {
      nameInput.classList.add("is-invalid");
      isValid = false;
    } else {
      nameInput.classList.remove("is-invalid");
    }

    if (!emailPattern.test(emailInput.value.trim())) {
      emailInput.classList.add("is-invalid");
      isValid = false;
    } else {
      emailInput.classList.remove("is-invalid");
    }

    if (!phonePattern.test(phoneInput.value.trim())) {
      phoneInput.classList.add("is-invalid");
      isValid = false;
    } else {
      phoneInput.classList.remove("is-invalid");
    }

    if (addressInput.value.trim() === "") {
      addressInput.classList.add("is-invalid");
      isValid = false;
    } else {
      addressInput.classList.remove("is-invalid");
    }

    if (messageInput.value.trim() === "") {
      messageInput.classList.add("is-invalid");
      isValid = false;
    } else {
      messageInput.classList.remove("is-invalid");
    }

    if (isValid) {
      successAlert.classList.remove("d-none");
      contactForm.reset();
    } else {
      successAlert.classList.add("d-none");
    }
  });
}
