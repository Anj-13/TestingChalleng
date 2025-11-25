// can edit

async function loadAveragePrice() {
    try{
        const response = await fetch("http://localhost:8000/average-price");
            const data = await response.json();

            const avgElement = document.getElementById("average-price");
            if(data.average_price) {
                avgElement.innerHTML = `
                <strong>$${data.average_price}</strong>
                <br>
                <small>Based on ${data.medicines_with_valid_prices} medicines </small>`;
            } else {
                avgElement.textContent = data.error || "Unable to calculate average";
            }
    } catch(error) {
        console.error("Error loading AVG price:", error);
        document.getElementById("average-price").textContent = "Error loading report"
    }
}

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

            if (medicines.length === 0) {
                medList.innerHTML = "<p>No medicines found. Add some medicines to get started.</p>";
                return;
            }

            for (let med of medicines) {
                const medContainer = document.createElement("div");
                medContainer.className = "medicine-item";
                
                const medName = document.createElement("h3");
                medName.innerText = med.name || "Unknown Med";
                medContainer.appendChild(medName);

                const medPrice = document.createElement("p");
                medPrice.innerText = `Price: $${med.price || "Not Available"}`;
                medContainer.appendChild(medPrice);

                // Add quick actions
                const quickActions = document.createElement("div");
                quickActions.className = "quick-actions";
                
                const updateBtn = document.createElement("button");
                updateBtn.textContent = "Quick Update";
                updateBtn.className = "quick-update-btn";
                updateBtn.onclick = () => {
                    document.getElementById('update-name').value = med.name;
                    document.getElementById('update-price').value = med.price;
                    document.getElementById('update-form').scrollIntoView({ behavior: 'smooth' });
                };
                
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Quick Delete";
                deleteBtn.className = "quick-delete-btn";
                deleteBtn.onclick = () => {
                    if (confirm(`Are you sure you want to delete "${med.name}"?`)) {
                        deleteMedicine(med.name);
                    }
                };
                
                quickActions.appendChild(updateBtn);
                quickActions.appendChild(deleteBtn);
                medContainer.appendChild(quickActions);

                medList.appendChild(medContainer);
            }
        } catch (error) {
            console.error("Error loading medicines:", error);
            showSuccessMessage("Error loading medicines", true);
        }
    }

    // Add Medicine draft
    const medForm = document.querySelector("#add-form");
    medForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const newMedicine = {
            name: event.target.name.value,
            price: event.target.price.value
        };

        clearErrors();
        let hasError = false;

        if (!newMedicine.name || newMedicine.name.length <= 2 || newMedicine.name.trim() === "") {
            showError("name", "Please enter a medicine name (min 3 characters)");
            hasError = true;
        }
        if (!newMedicine.price || isNaN(parseFloat(newMedicine.price)) || newMedicine.price < 0) {
            showError("price", "Please enter a valid price");
            hasError = true;
        }

        if (hasError) return;

        const formData = new FormData();
        formData.append("name", newMedicine.name);
        formData.append("price", newMedicine.price);

        fetch("http://localhost:8000/create", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            medForm.reset();
            clearErrors();
            loadMedicines();
            showSuccessMessage(data.message || "Medicine added successfully!");
        })
        .catch(error => {
            console.error("Error:", error);
            showSuccessMessage("Failed to add medicine. Please try again.", true);
        });
    });

    // Update Medicine Form
    const updateForm = document.querySelector("#update-form");
    updateForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const updateData = {
            name: event.target['update-name'].value,
            price: event.target['update-price'].value
        };

        clearErrors();
        let hasError = false;

        if (!updateData.name || updateData.name.trim() === "") {
            showError("update-name", "Please enter a medicine name");
            hasError = true;
        }
        if (!updateData.price || isNaN(parseFloat(updateData.price)) || updateData.price < 0) {
            showError("update-price", "Please enter a valid price");
            hasError = true;
        }

        if (hasError) return;

        const formData = new FormData();
        formData.append("name", updateData.name);
        formData.append("price", updateData.price);

        fetch("http://localhost:8000/update", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.error) {
                showSuccessMessage(data.error, true);
            } else {
                updateForm.reset();
                clearErrors();
                loadMedicines();
                showSuccessMessage(data.message || "Medicine updated successfully!");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            showSuccessMessage("Failed to update medicine. Please try again.", true);
        });
    });

    // Delete Medicine Form
    const deleteForm = document.querySelector("#delete-form");
    deleteForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const medicineName = event.target['delete-name'].value;

        clearErrors();
        if (!medicineName || medicineName.trim() === "") {
            showError("delete-name", "Please enter a medicine name");
            return;
        }

        if (!confirm(`Are you sure you want to delete "${medicineName}"? This action cannot be undone.`)) {
            return;
        }

        deleteMedicine(medicineName);
    });

    // Delete medicine function
    async function deleteMedicine(name) {
        const formData = new FormData();
        formData.append("name", name);

        try {
            const response = await fetch("http://localhost:8000/delete", {
                method: "DELETE",
                body: formData
            });
            const data = await response.json();
            
            if (data.error) {
                showSuccessMessage(data.error, true);
            } else {
                document.getElementById('delete-name').value = '';
                clearErrors();
                loadMedicines();
                showSuccessMessage(data.message || "Medicine deleted successfully!");
            }
        } catch (error) {
            console.error("Error:", error);
            showSuccessMessage("Failed to delete medicine. Please try again.", true);
        }
    }

    loadAveragePrice();

    // Initial load
    await loadMedicines();
});