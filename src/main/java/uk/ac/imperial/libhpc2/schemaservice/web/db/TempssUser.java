/*
 * Copyright (c) 2015, Imperial College London
 * Copyright (c) 2015, The University of Edinburgh
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the names of the copyright holders nor the names of their
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * -----------------------------------------------------------------------------
 *
 * This file is part of the TemPSS - Templates and Profiles for Scientific 
 * Software - service, developed as part of the libhpc projects 
 * (http://www.imperial.ac.uk/lesc/projects/libhpc).
 *
 * We gratefully acknowledge the Engineering and Physical Sciences Research
 * Council (EPSRC) for their support of the projects:
 *   - libhpc: Intelligent Component-based Development of HPC Applications
 *     (EP/I030239/1).
 *   - libhpc Stage II: A Long-term Solution for the Usability, Maintainability
 *     and Sustainability of HPC Software (EP/K038788/1).
 */

package uk.ac.imperial.libhpc2.schemaservice.web.db;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import org.hibernate.validator.constraints.Email;
import org.hibernate.validator.constraints.NotBlank;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class TempssUser {
	
	@NotBlank
	private String username;
	
	@NotNull
	@Size(min = 8, max = 48)
	private String password;
	
	@NotNull
	@Size(min = 8, max = 48)
	private String password2;
	
	@NotBlank
	@Email
	private String email;
	
	@NotBlank
	private String firstname;
	
	private String lastname;
	
	/**
	 * true (1) if the user is locked, false (0) otherwise. 
	 * A locked user cannot log in.
	 */
	private boolean locked;
	
	public TempssUser() { } 
	
	public TempssUser(String pUsername, String pPassword, String pEmail, 
            String pFirstname, String pLastname) {
		this(pUsername, pPassword, pEmail, pFirstname, pLastname, "");
	}
	
	public TempssUser(String pUsername, String pPassword, String pEmail, 
                      String pFirstname, String pLastname, String pPassword2) { 
		this.username = pUsername;
		this.password = pPassword;
		this.email = pEmail;
		this.firstname = pFirstname;
		this.lastname = pLastname;
		this.password2 = pPassword2; // for password verification
		this.locked = false;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String pUsername) {
		this.username = pUsername;
	}
	
	public String getPassword() {
		return this.password;
	}

	public void setPassword(String pPassword) {
		this.password = pPassword;
	}
	
	public String getEmail() {
		return email;
	}

	public void setEmail(String pEmail) {
		this.email = pEmail;
	}

	public String getFirstname() {
		return firstname;
	}

	public void setFirstname(String pFirstname) {
		this.firstname = pFirstname;
	}

	public String getLastname() {
		return lastname;
	}

	public void setLastname(String pLastname) {
		this.lastname = pLastname;
	}
	
	public String getPassword2() {
		return this.password2;
	}

	public void setPassword2(String pPassword2) {
		this.password2 = pPassword2;
	}
	
	public boolean getLocked() {
		return this.locked;
	}

	public void setLocked(boolean pLocked) {
		this.locked = pLocked;
	}
}
