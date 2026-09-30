const deleteFolderButtons = document.querySelectorAll(".delete-folder-button");

for (let button of deleteFolderButtons) {
  button.addEventListener("click", async () => {
    try {
      const folderId = button.dataset.id;
      const response = await fetch(`/folders/${folderId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      console.log(result);

      if (response.status === 200) {
        window.location.href = "/dashboard";
      } else {
        const message = document.createElement("div");
        message.textContent = result.msg;
        button.parentNode.appendChild(message);
      }
    } catch (err) {
      throw new Error(err);
    }
  });
}
