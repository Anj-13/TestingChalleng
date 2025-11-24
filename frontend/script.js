// can edit

function showError(field, message) {
    const errorElement = document.getElementById(`${field}-error`);
    const inputElement = document.getElementById(field);

    if (errorElement && inputElement) {
        errorElement.textContent = message;
        errorElement.classList.add("show");
        inputElement.classList.add("input-error");
    }
}
function clearErrors() {
    // Clear all error messages
    const errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach(element => {
        element.textContent = "";
        element.classList.remove("show");
    });

    // Remove error styling from inputs
    const inputElements = document.querySelectorAll("input");
    inputElements.forEach(input => {
        input.classList.remove("input-error");
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    window.loadMedicines = async function () {
        try {
            const response = await fetch("http://localhost:8000/medicines");
            const data = await response.json();
            const medicines = data.medicines.reverse();
    
            const medList = document.querySelector("#test-list");
            medList.innerHTML = ""; // clear the list
    
            for (let med of medicines) {
                const medContainer = document.createElement("div");
                medContainer.className = "medicine-item"
                const medName = document.createElement("h1");
                if (med.name) {
                    medName.innerText = med.name;
                } else {
                    medName.innerText = "Unknown Med";
                }
    
    
                medContainer.appendChild(medName);
    
                const medPrice = document.createElement("p")
                if (med.price) {
                    medPrice.innerText = `Price: $${med.price}`;
                } else {
                    medPrice.innerText = "Price: Not Available";
                }
    
    
                medContainer.appendChild(medPrice);
    
                medList.appendChild(medContainer);
            }
        } catch (error) {
            console.error("Error loading", error);
        }
        
        // try {
        //     const response = await fetch("http://localhost:8000/medicines");
        //     const data = await response.json();
        //     const medicines = data.medicines;
    
        //     const medList = document.querySelector("#test-list");
    
        //     for (let med of medicines) {
        //         const medContainer = document.createElement("div");
        //         medContainer.className = "medicine-item"
        //         const medName = document.createElement("h1");
        //         if (med.name) {
        //             medName.innerText = med.name;
        //         } else {
        //             medName.innerText = "Unknown Med";
        //         }
    
    
        //         medContainer.appendChild(medName);
    
        //         const medPrice = document.createElement("p")
        //         if (med.price) {
        //             medPrice.innerText = `Price: $${med.price}`;
        //         } else {
        //             medPrice.innerText = "Price: Not Available";
        //         }
    
    
        //         medContainer.appendChild(medPrice);
    
        //         medList.appendChild(medContainer);
        //     }
        // } catch (error) {
        //     console.error("Error loading", error);
        // }
    }
    
    await loadMedicines();
    
    // adding medicine draft
    const medForm = document.querySelector("form");
    medForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const newMedicine = {};

        newMedicine.name = event.target.name.value;
        newMedicine.price = event.target.price.value;

        clearErrors();

        let hasError = false;

        if (!newMedicine.name || newMedicine.name.length <= 2 || newMedicine.name.trim() === "") {
            showError("name", "Please enter a medicine name");
            hasError = true;
        }
        if (!newMedicine.price || isNaN(parseFloat(newMedicine.price)) || newMedicine.price < 0) {
            showError("price", "Please enter a valid price");
            hasError = true;
        }

        if (hasError) {
            return;
        }

        const formData = new FormData();
        formData.append("name", newMedicine.name)
        formData.append("price", newMedicine.price)

        fetch("http://localhost:8000/create", {
            method: "POST",
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                medForm.reset();
                clearErrors();

                loadMedicines(); // reload with the newest at the top

                if (data.message) {
                    alert (data.message);
                    showSuccessMessage(data.message);
                }
            })
            .catch(error => {
                console.error("Error: ", error)
                showError("form", "Failed to add medicine. Please try again")
            })
    })

    function showSuccessMessage(message) {
        const successElement = document.createElement("div");
        successElement.textContent = message;

        const form = document.querySelector("form");
        form.parentNode.insertBefore(successElement, form);
    }

})