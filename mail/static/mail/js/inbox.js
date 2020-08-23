document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', () => submit_email(event));
  document.querySelectorAll('#inbox-body').forEach(item => {
    item.addEventListener('click', () => load_email(event));
  });
  document.querySelector("#button1").addEventListener("click", () => evbuttons(event));
  document.querySelector("#button2").addEventListener("click", () => evbuttons(event));
  document.querySelector("#button3").addEventListener("click", () => evbuttons(event));
  document.querySelector("#button4").addEventListener("click", () => evbuttons(event));
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
  if (document.querySelector(".alert-danger")) {
    document.querySelector(".alert-danger").style.display = "none";
  }
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#inbox-header').innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;
  document.querySelector("#inbox-body").textContent = "";
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    var inboxbody = document.querySelector("#inbox-body");
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
          newTr.className = "maillink bg-secondary font-weight-normal";
        }
        else if (!emails[i].read && mailbox == "inbox") {
          newTr.className = "maillink bg-light font-weight-bold";
        }
        inboxbody.appendChild(newTr);
      }
    }
    else {
      var newTr = document.createElement("tr");
      newTr.className = "bg-light";
      var newTd = document.createElement("td");
      newTd.colSpan = "3";
      newTd.textContent = `No emails in your ${mailbox} mailbox yet.`;
      newTd.dataset.emptybox = "true";
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
      load_mailbox("sent");
      if (result.error) {
        if (document.querySelector(".alert-danger")) {
          document.querySelector(".alert-danger").innerHTML = result.error;
          document.querySelector(".alert-danger").style.display = "block";
        }
        else {
          var newAlert = document.createElement("div");
          newAlert.className = "alert alert-danger";
          newAlert.innerHTML = result.error;
          var getAlert = document.querySelector("#getAlert");
          getAlert.insertBefore(newAlert, null);
        }
      }
  });
}

function load_email(ev) {
  if (ev.target.dataset.emptybox != "true") {
    document.querySelector(".modal").style.display = "block";
    console.log(ev.target.parentElement.dataset.emailid);
    fetch(`/emails/${ev.target.parentElement.dataset.emailid}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    });
    fetch(`/emails/${ev.target.parentElement.dataset.emailid}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);
      document.querySelector("#mailsender").innerHTML = `<strong>From</strong> : ${email.sender}`;
      document.querySelector("#mailrecipient").innerHTML = `<strong>To</strong> : `;
      var recips = document.querySelector("#mailrecipient");
      for (var c = 0; c < email.recipients.length; c++) {
        var newSpan = document.createElement("span");
        newSpan.innerHTML = email.recipients[c];
        recips.appendChild(newSpan);
      }
      document.querySelector("#mailsubject").innerHTML = `<strong>Subject</strong> : ${email.subject}`;
      document.querySelector("#maildate").innerHTML = `<strong>Date</strong> : ${email.timestamp}`;
      email.body = email.body.replace(/(?:\r\n|\r|\n)/g, '<br>');
      document.querySelector("#mailcontent").innerHTML = `<strong>Body</strong> : <br> ${email.body}`;
      var boxname = document.querySelector("#inbox-header").innerHTML;
      var btn1 = document.querySelector("#button1");
      var btn2 = document.querySelector("#button2");
      var btn3 = document.querySelector("#button3");
      var btn4 = document.querySelector("#button4");
      btn1.className = "btn btn-danger";
      btn1.dataset.emailid = `${ev.target.parentElement.dataset.emailid}`;
      btn1.innerHTML = "Close";
      if (boxname == "Inbox") {
        btn2.style.display = "block";
        btn2.className = "btn btn-warning";
        btn2.dataset.emailid = `${ev.target.parentElement.dataset.emailid}`;
        btn2.innerHTML = "Archive";
        btn3.style.display = "none";
        btn4.style.display = "block";
        btn4.className = "btn btn-primary";
        btn4.dataset.emailid = `${ev.target.parentElement.dataset.emailid}`;
        btn4.innerHTML = "Reply";
      }
      if (boxname == "Sent") {
        btn4.style.display = "none";
        btn3.style.display = "none";
        btn2.style.display = "none";
      }
      else if (boxname == "Archive") {
        btn4.style.display = "none";
        btn2.style.display = "none";
        var btn3 = document.querySelector("#button3");
        btn3.style.display = "block";
        btn3.className = "btn btn-warning";
        btn3.dataset.emailid = `${ev.target.parentElement.dataset.emailid}`;
        btn3.innerHTML = "Unarchive";
      }
    });
  }
}

function evbuttons(evt) {
  var actualBox = document.querySelector("#inbox-header").innerHTML;
  var btnclicked = evt.target.id;
  if (actualBox == "Inbox" && btnclicked == "button1") {
    document.querySelector(".modal").style.display = "none";
    load_mailbox("inbox");
  }
  else if (actualBox == "Inbox" && btnclicked == "button2") {
    fetch(`/emails/${evt.target.dataset.emailid}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
    .then(response => {
      document.querySelector(".modal").style.display = "none";
      load_mailbox("inbox");
    });
  }
  else if (actualBox == "Inbox" && btnclicked == "button4") {
    document.querySelector(".modal").style.display = "none";
    reply_email(evt.target.dataset.emailid);
  }
  else if (actualBox == "Sent" && btnclicked == "button1") {
    document.querySelector(".modal").style.display = "none";
    load_mailbox("sent");
  }
  else if (actualBox == "Archive" && btnclicked == "button1") {
    document.querySelector(".modal").style.display = "none";
    load_mailbox("archive");
  }
  else if (actualBox == "Archive" && btnclicked == "button3") {
    fetch(`/emails/${evt.target.dataset.emailid}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
    .then(response => {
      document.querySelector(".modal").style.display = "none";
      load_mailbox("inbox");
    });
  }
}

function reply_email(emailId) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  fetch(`/emails/${emailId}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    document.querySelector('#compose-recipients').value = email.sender;
    if (!email.subject.startsWith("Re : ")) {
      document.querySelector('#compose-subject').value = "Re : " + email.subject;
    }
    else {
      document.querySelector('#compose-subject').value = email.subject;
    }
    document.querySelector('#compose-body').value = "\r\n\r\n\r\n" + "Original message on " + email.timestamp + ": \r\n" + email.body;
  });
}