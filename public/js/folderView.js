const deleteCurrentFolderBtn = document.querySelector(
  "#delete-current-folder-btn",
);

if (deleteCurrentFolderBtn) {
  deleteCurrentFolderBtn.addEventListener("click", () => {
    deleteFolder(deleteCurrentFolderBtn);
  });
}

const deleteFolderButtons = document.querySelectorAll(".delete-subfolder-btn");

for (let button of deleteFolderButtons) {
  button.addEventListener("click", () => {
    deleteFolder(button);
  });
}

async function deleteFolder(button) {
  button.disabled = true;
  try {
    const folderId = button.dataset.id;
    const response = await fetch(`/folders/${folderId}`, {
      method: "DELETE",
    });

    if (response.status === 200) {
      const result = await response.json();
      window.location.href = `/folders/${result.parentFolderId}`;
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
}

const editFileButtons = document.querySelectorAll(".edit-file-btn");

for (let button of editFileButtons) {
  button.addEventListener("click", () => {
    const dialog = document.querySelector("#edit-file-dialog");
    const editFileForm = dialog.querySelector("form");
    const filenameInput = dialog.querySelector("input");
    let filename = button.dataset.filename;
    filename = filename.substring(0, filename.lastIndexOf(".")) || filename;
    filenameInput.value = filename;
    editFileForm.action = `/files/${button.dataset.fileId}?_method=PUT&context=${button.dataset.context}`;

    dialog.showModal();
  });
}

const deleteFileButtons = document.querySelectorAll(".delete-file-btn");

for (let button of deleteFileButtons) {
  button.addEventListener("click", () => {
    const dialog = document.querySelector("#delete-file-dialog");
    const deleteFileForm = dialog.querySelector("form");
    deleteFileForm.action = `/files/${button.dataset.fileId}?_method=DELETE&context=${button.dataset.context}`;

    dialog.showModal();
  });
}
