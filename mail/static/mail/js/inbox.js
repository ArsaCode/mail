document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', function() {
    submit_email(event);
    load_mailbox("sent");
  });
  document.querySelectorAll('#inbox-body').forEach(item => {
    item.addEventListener('click', () => load_email(event));
  })
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
        newTr.dataset.emailid = emails[i].id;
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
          newTr.className = "maillink bg-secondary font-weight-normal hovereffect";
        }
        else if (!emails[i].read && mailbox == "inbox") {
          newTr.className = "maillink bg-light font-weight-bold hovereffect";
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
}

function clearcontent(elementID) {
  document.querySelector(`#${elementID}`).innerHTML = "";
}

function load_email(ev) {
  document.querySelector(".modal").style.display = "block";
  console.log(ev.target.parentElement.dataset.emailid);
  fetch(`/emails/${ev.target.parentElement.dataset.emailid}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })  
  fetch(`/emails/${ev.target.parentElement.dataset.emailid}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    document.querySelector("#mailsender").innerHTML = `<strong>From</strong> : ${email.sender}`;
    document.querySelector("#mailrecipient").innerHTML = `<strong>To</strong> :`;
    var recips = document.querySelector("#mailrecipient");
    for (var c = 0; c < email.recipients.length; c++) {
      var newSpan = document.createElement("span");
      newSpan.innerHTML = email.recipients[c];
      recips.appendChild(newSpan);
    }
    document.querySelector("#mailsubject").innerHTML = `<strong>Subject</strong> : ${email.subject}`;
    document.querySelector("#maildate").innerHTML = `<strong>Date</strong> : ${email.timestamp}`;
    document.querySelector("#mailcontent").innerHTML = `<strong>Body</strong> : ${email.body}`;
  });
  document.querySelector("#closemail").addEventListener("click", () => {
    document.querySelector(".modal").style.display = "none";
    load_mailbox("inbox");
  })
  document.querySelector("#archivemail").addEventListener("click", () => {
    fetch(`/emails/${ev.target.parentElement.dataset.emailid}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
    document.querySelector(".modal").style.display = "none";
    load_mailbox("inbox");
  })
}
