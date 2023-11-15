import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { Circle } from "react-feather";

const getImage = (userId) => {
	const userImages = {
		"usr-1":
			"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXNlcnxlbnwwfHwwfHx8MA%3D%3D",
		"usr-2":
			"https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg?size=626&ext=jpg&ga=GA1.1.1413502914.1699920000&semt=ais",
		"usr-3":
			"https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZmFjZXxlbnwwfHwwfHx8MA%3D%3D",
		"usr-4":
			"https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D",
		"usr-5":
			"https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHVzZXJ8ZW58MHx8MHx8fDA%3D",
	};

	const userimg = userImages[userId];
	return (
		<div className="image-cnt">
			<img className="user-image" src={userimg}></img>
		</div>
	);
};

const Ticket = ({ ticket }) => {
	const colors = {
		4: "red",
		3: "orange",
		2: "yellow",
		1: "green",
		0: "gray",
	};

	return (
		<div className="ticket" style={{ borderColor: colors[ticket.priority] }}>
			<div className="title-tk">
				<p> {ticket.id}</p>
				{getImage(ticket.userId)}
			</div>
			<h4>{ticket.title}</h4>
			<div className="tag">
				<Circle  className="dot-tag"/>
				<p>{ticket.tag.join(", ")}</p>
			</div>
		</div>
	);
};

const Column = ({ title, tickets, users }) => {
	const priorityLabels = {
		4: "Urgent",
		3: "High",
		2: "Medium",
		1: "Low",
		0: "No priority",
	};

	const displayTitle = priorityLabels[parseInt(title, 10)] || title;
	const displayName = users.find((user) => user.id === title)?.name || "";

	return (
		<div className="column">
			<h3>
				{displayName !== "" ? (
					<span>{displayName}</span>
				) : (
					<span>{displayTitle}</span>
				)}
			</h3>

			<div className="tickets">
				{tickets.map((ticket) => (
					<Ticket key={ticket.id} ticket={ticket} />
				))}
			</div>
		</div>
	);
};

const App = () => {
	const [data, setData] = useState(null);
	const [group, setGroup] = useState(localStorage.getItem("group") || "status");
	const [sort, setSort] = useState(localStorage.getItem("sort") || "priority");
	const [columns, setColumns] = useState([]);

	const fetchData = async () => {
		try {
			const response = await axios.get(
				"https://api.quicksell.co/v1/internal/frontend-assignment"
			);
			setData(response.data);
		} catch (error) {
			console.error(error);
		}
	};

	const groupBy = (key) => {
		const grouped = {};

		data.tickets.forEach((ticket) => {
			const value = ticket[key];
			if (!grouped[value]) {
				grouped[value] = [];
			}
			grouped[value].push(ticket);
		});
		return grouped;
	};

	const sortBy = (key, tickets) => {
		if (key === "priority") {
			tickets.sort((a, b) => b[key] - a[key]);
		} else if (key === "title") {
			tickets.sort((a, b) => a[key].localeCompare(b[key]));
		}
		return tickets;
	};

	const updateColumns = () => {
		const grouped = groupBy(group);

		const newColumns = [];

		for (const key in grouped) {
			const column = {
				title: key,
				tickets: sortBy(sort, grouped[key]),
			};
			newColumns.push(column);
		}

		setColumns(newColumns);
	};

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		if (data) {
			updateColumns();
			localStorage.setItem("group", group);
			localStorage.setItem("sort", sort);
		}
	}, [data, group, sort]);

	const handleGroupChange = (event) => {
		setGroup(event.target.value);
	};

	const handleSortChange = (event) => {
		setSort(event.target.value);
	};

	return (
		<div className="app">
			<div className="navbar">
				<div className="controls">
					<div className="group">
						<label htmlFor="group">Group by:</label>
						<select id="group" value={group} onChange={handleGroupChange}>
							<option value="status">Status</option>
							<option value="userId">User</option>
							<option value="priority">Priority</option>
						</select>
					</div>
					<div className="sort">
						<label htmlFor="sort">Sort by:</label>
						<select id="sort" value={sort} onChange={handleSortChange}>
							<option value="priority">Priority</option>
							<option value="title">Title</option>
						</select>
					</div>
				</div>
			</div>
			<div className="board">
				{columns.map((column) => (
					<Column
						key={column.title}
						title={column.title}
						tickets={column.tickets}
						users={data.users}
					/>
				))}
			</div>
		</div>
	);
};

export default App;
