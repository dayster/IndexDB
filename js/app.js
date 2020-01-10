let DB;

const form = document.querySelector('form'),
	  petName = document.querySelector('#pet-name'),
	  ownerName = document.querySelector('#owner-name'),
	  phone = document.querySelector('#phone'),
	  date = document.querySelector('#date'),
	  hour = document.querySelector('#hour'),
	  symptoms = document.querySelector('#symptoms'),
	  appointments = document.querySelector('#appointments'),
	  appointmentTitle = document.querySelector('#appointment-title');

document.addEventListener('DOMContentLoaded', () => {
	let AppointmentDB = window.indexedDB.open('appointments', 1);

	// If errors
	AppointmentDB.onerror = function(){
		console.log('There was an error');
	}
	// If Ok

	AppointmentDB.onsuccess = function(){
		 DB = AppointmentDB.result;

		 displayAppointments();
	}

	AppointmentDB.onupgradeneeded = function(e){
		let db = e.target.result;
		
		let objectStore = db.createObjectStore('appointments', { keyPath: 'key', autoIncrement: true });
		
		objectStore.createIndex('petname', 'petname', { unique: false });
		objectStore.createIndex('ownerName', 'ownerName', { unique: false });
		objectStore.createIndex('phone', 'phone', { unique: false });
		objectStore.createIndex('date', 'date', { unique: false });
		objectStore.createIndex('hour', 'hour', { unique: false });
		objectStore.createIndex('symptoms', 'symptoms', { unique: false });

		console.log('Database Ready!!!');
	}

	form.addEventListener('submit', addAppointMent);

	function addAppointMent(e){
		e.preventDefault();

		let newAppointment = {
			petname: petName.value,
			ownerName: ownerName.value,
			phone: phone.value,
			date: date.value,
			hour: hour.value,
			symptoms: symptoms.value
		}

		// Insert Data

		let transaction = DB.transaction(['appointments'], 'readwrite');
		let objectStore = transaction.objectStore('appointments');

		console.log(objectStore);

		let request = objectStore.add(newAppointment);

		request.onsuccess = () => {
			form.reset();
		}

		transaction.oncomplete = () => {
			console.log('New Appointment Add');

			displayAppointments();
		}

		transaction.onerror = () => {
			console.log('There was error');
		}
	}

	function displayAppointments(){
		while(appointments.firstChild){
			appointments.removeChild(appointments.firstChild);
		}
		let objectStore = DB.transaction('appointments').objectStore('appointments');

		objectStore.openCursor().onsuccess = function(e){
			let cursor = e.target.result;

			if(cursor){
				let appointmentHTML = document.createElement('li');
				appointmentHTML.setAttribute('data-appointment-id', cursor.value.key);
				appointmentHTML.classList.add('list-group-item');

				appointmentHTML.innerHTML = `
					<p class="font-weight-bold">Pet Name : <span class="font-weight-bold">${cursor.value.petname}</span></p>
					<p class="font-weight-bold">Owner Name : <span class="font-weight-bold">${cursor.value.ownerName}</span></p>
					<p class="font-weight-bold">Phone : <span class="font-weight-bold">${cursor.value.phone}</span></p>
					<p class="font-weight-bold">Date : <span class="font-weight-bold">${cursor.value.date}</span></p>
					<p class="font-weight-bold">Hour : <span class="font-weight-bold">${cursor.value.hour}</span></p>
					<p class="font-weight-bold">Symtoms : <span class="font-weight-bold">${cursor.value.symptoms}</span></p>
				`;

				const removeBTM = document.createElement('button')
				removeBTM.classList.add('btn', 'btn-danger');
				removeBTM.innerHTML = '<span aria-hidden="true">x</span> Remove';
				removeBTM.onclick = removeAppointment;

				appointmentHTML.appendChild(removeBTM);
				appointments.appendChild(appointmentHTML);
				cursor.continue();
			}else{
				if(!appointments.firstChild){
					appointmentTitle.textContent = 'Add New Appointments';
					let noAppointment = document.createElement('p');
					noAppointment.classList.add('text-center');
					noAppointment.textContent = 'No Appointments Found';
					appointments.appendChild(noAppointment);
				}else{
					appointmentTitle.textContent = 'Manage Your Appointments'
				}
			}
		}
	}

	function removeAppointment(e){
		let appointmentID = Number(e.target.parentElement.getAttribute('data-appointment-id'));
		let transaction = DB.transaction(['appointments'], 'readwrite');
		let objectStore = transaction.objectStore('appointments');
		objectStore.delete(appointmentID);
		console.log(appointmentID);

		transaction.oncomplete = () => {
			e.target.parentElement.parentElement.removeChild(e.target.parentElement);
			if(!appointments.firstChild){
				appointmentTitle.textContent = 'Add New Appointments';
				let noAppointment = document.createElement('p');
				noAppointment.classList.add('text-center');
				noAppointment.textContent = 'No Appointments Found';
				appointments.appendChild(noAppointment);
			}else{
				appointmentTitle.textContent = 'Manage Your Appointments'
			}
		}
	}
});
