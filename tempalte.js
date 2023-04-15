const submitBtn = document.getElementById("submit-btn");
submitBtn.addEventListener("click", function(event) {
  event.preventDefault();
  
  const inputVal = document.getElementById("inputBox").value;
  filterNodes(inputVal);
});