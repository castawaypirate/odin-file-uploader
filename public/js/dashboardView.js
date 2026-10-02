const deleteFolderButtons = document.querySelectorAll(".delete-subfolder-btn");

for (let button of deleteFolderButtons) {
  button.addEventListener("click", async () => {
    // prevents double click
    button.disabled = true;
    try {
      const folderId = button.dataset.id;
      const response = await fetch(`/folders/${folderId}`, {
        method: "DELETE",
      });

      if (response.status === 200) {
        window.location.href = "/dashboard";
        return;
      }

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if ([400, 403, 404].includes(response.status)) {
        const result = await response.json();
        window.alert(result.msg);
      } else {
        window.alert("Something went wrong");
      }
    } catch (err) {
      console.error(err);
      window.alert("Something went wrong");
    }

    button.disabled = false;
  });
}
