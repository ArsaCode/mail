document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', submit_email(e));
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#inbox-header').innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;
  clearcontent("inbox-body");
  const inboxbody = document.querySelector("#inbox-body");
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);
    if (emails.length > 0) {
      for (var i = 0; i < emails.length; i++)
      {
        var newTr = document.createElement("tr");
        var newTd1 = document.createElement("td");
        var newTd2 = document.createElement("td");
        var newTd3 = document.createElement("td");
        newTd1.textContent = emails[i].sender;
        newTd2.textContent = emails[i].subject;
        newTd3.textContent = emails[i].timestamp;
        newTr.appendChild(newTd1);
        newTr.appendChild(newTd2);
        newTr.appendChild(newTd3);
        if (emails[i].read && mailbox == "inbox") {
          newTr.className = "bg-secondary font-weight-normal";
        }
        else if (!emails[i].read && mailbox == "inbox") {
          newTr.className = "bg-light font-weight-bold";
        }
        inboxbody.appendChild(newTr);
      }
    }
    else {
      var newTr = document.createElement("tr");
      newTr.className = "bg-light";
      var newTd = document.createElement("td");
      newTd.colSpan = "3";
      newTd.textContent = `No emails in your ${mailbox} mailbox yet.`
      newTr.appendChild(newTd);
      inboxbody.appendChild(newTr);
    }
  });
}

function submit_email(e) {
  e.preventDefault();
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
  load_mailbox("sent");
}

function clearcontent(elementID) {
  document.querySelector(`#${elementID}`).innerHTML = "";
}