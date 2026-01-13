const Rules = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="font-poppins text-3xl font-bold text-slate-primary mb-2">
              Visitors' Hostel Rules & Regulations
            </h1>
            <p className="text-gray-600">IIIT Design & Manufacturing Jabalpur</p>
            <p className="text-secondary font-medium mt-2">Contact: vh@iiitdmj.ac.in</p>
          </div>

          {/* General Instructions */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-primary mb-4 border-b-2 border-secondary pb-2">
              I. General Instructions for Booking
            </h2>
            <ol className="space-y-3 text-gray-700">
              <li className="flex">
                <span className="font-semibold mr-2">1.</span>
                <span>
                  Booking can be done by submitting duly filled in requisition form along with valid approval 
                  to the Incharge VH through email/in hard copy. Email id: <strong>vh@iiitdmj.ac.in</strong>
                </span>
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">2.</span>
                <span>The bookings are purely provisional and subject to availability.</span>
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">3.</span>
                <span>Priority will be given to Institute guests, visitors coming for academic activities.</span>
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">4.</span>
                <span>
                  Personal bookings (10% of total rooms) will be made on the basis of availability. 
                  Such bookings will be provisional and will be confirmed only 3 days before the actual arrival of the guest.
                </span>
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">5.</span>
                <span>
                  Students may be allotted accommodation in VH for their PARENTS/SPOUSE, if the same is not 
                  available in Hostel guestrooms. Students should get their requisition forms forwarded by respective warden.
                </span>
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">6.</span>
                <span>
                  Telephonic bookings/cancellations of any of the VH facilities will not be entertained, 
                  unless there is some emergency.
                </span>
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">7.</span>
                <span>
                  Confirmation/non-Acceptance of bookings will be informed through e-mail or can be checked 
                  with VH office within 24 hours of submission of the requisition form.
                </span>
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">8.</span>
                <span>
                  The room will be allotted on the condition that, if necessary, the allottee would not have any 
                  objection in sharing accommodation with other guest.
                </span>
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">9.</span>
                <span>Guests of category C will be allowed to stay up to 5 (Five) days only.</span>
              </li>
            </ol>
          </section>

          {/* Guest Specific Information */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-primary mb-4 border-b-2 border-secondary pb-2">
              II. Guest Specific Information
            </h2>
            <ol className="space-y-3 text-gray-700">
              <li className="flex">
                <span className="font-semibold mr-2">1.</span>
                <span>Check-in Check-out facility: 24 Hours.</span>
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">2.</span>
                <span>Approval for the extended stay has to be obtained beforehand.</span>
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">3.</span>
                <span>Meals can be booked at the VH Dining Hall: (Lunch by 09:00 Hrs and Dinner by 14:00 Hrs).</span>
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">4.</span>
                <span>
                  No claims for loss/damage or lapse of services will be entertained at any stage by the Institute 
                  as most of the services are obtained through external parties.
                </span>
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">5.</span>
                <span>
                  Guests are advised to get the rooms cleaned in their presence only. If the guest has no objection 
                  for getting the room cleaned in his/her absence, he/she should deposit the room keys at the front office.
                </span>
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">6.</span>
                <span className="text-red-600 font-semibold">
                  Consumption of Narcotics/Alcoholic drinks and Smoking is strictly prohibited in VH.
                </span>
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">7.</span>
                <span>
                  In order to keep bills ready & minimize inconvenience at check-out time, the caretaker of the VH 
                  should be kept informed about the exact departure well in advance.
                </span>
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">8.</span>
                <span>
                  The guest is requested to verify/certify the final bill and pay all the dues wherever applicable before departure.
                </span>
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">9.</span>
                <span>All charges are to be paid in Cash to the caretaker of the VH.</span>
              </li>
            </ol>
          </section>

          {/* Visitors Category */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-primary mb-4 border-b-2 border-secondary pb-2">
              III. Visitors' Category for the Purpose of Tariff Collection
            </h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Category A</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Institute Guests/Directors/Examiners/External Members of Institute Committees</li>
                  <li>Invited Speakers/CAG Audit Team/MoE officials</li>
                  <li>Important guests of Chairman, BOG/Director/Senate/BWC/Statutory bodies</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Category B</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Institute employee & their dependents</li>
                  <li>Project employee & their dependents</li>
                  <li>Retired IIITDMJ Faculty/Staff/Alumni</li>
                  <li>Relatives/Guests of IIITDMJ Faculty & Staff</li>
                  <li>Other than Institute employees staying for Institute work</li>
                  <li>Any other Guest (Approved by the Director)</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Category C</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Employees of other IIITs/IITs/Centrally funded engineering colleges/universities/PSUs</li>
                  <li>Parents/Guardian/Spouse of IIITDMJ students</li>
                  <li>Visitors of government/public sector organization</li>
                  <li>Trainees coming to the Institute under programmes organized by the Institute</li>
                  <li>Others (Approved by the Director)</li>
                  <li>The guest of State/Central or other Governments and those are not Institute guest</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Category D</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Contractors, representatives of firms, vendors etc. coming for their work viz. meeting, presentations etc. and requesting to stay in the VH</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Tariff - Lodging Charges */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-primary mb-4 border-b-2 border-secondary pb-2">
              IV. Tariff: Lodging & Boarding Charges (w.e.f. 1st September 2023)
            </h2>
            
            <h3 className="font-semibold text-gray-800 mb-3">(i) Lodging (Stay) Charges</h3>
            
            {/* Standard Rooms Table */}
            <div className="overflow-x-auto mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">All rooms except suite rooms:</p>
              <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">Category</th>
                    <th className="border border-gray-300 px-4 py-2">Single Occupancy</th>
                    <th className="border border-gray-300 px-4 py-2">Double Occupancy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">Category A</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-green-600 font-semibold">Free</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-green-600 font-semibold">Free</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">Category B</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">₹800/-</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">₹1,000/-</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">Category C</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">₹1,200/-</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">₹1,500/-</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">Category D</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">₹1,500/-</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">₹1,800/-</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Suite Rooms Table */}
            <div className="overflow-x-auto mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Suite rooms:</p>
              <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">Category</th>
                    <th className="border border-gray-300 px-4 py-2">Single/Double Occupancy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">Category A</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-green-600 font-semibold">Free</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">Category B</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">₹2,000/-</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">Category C</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">₹2,500/-</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">Category D</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">₹2,500/-</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Food Charges */}
            <h3 className="font-semibold text-gray-800 mb-3 mt-6">(ii) Food Charges</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">(a) For the Visitors staying in VH:</p>
                <table className="min-w-full border-collapse border border-gray-300">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Full Day Meal (Morning Tea, Breakfast, Lunch & Dinner)</td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold">₹400/-</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Breakfast (Per Head)</td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold">₹100/-</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Lunch/Dinner (Per Head)</td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold">₹150/-</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Tea</td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold">₹15/-</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Milk per glass</td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold">₹30/-</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">(b) Visitors not staying in VH:</p>
                <table className="min-w-full border-collapse border border-gray-300">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        For Workshop/Seminar/Conference and other Institute event Lunch & Dinner (per person/plate)
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold">₹150/-</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        Employee of the Institute and others not stayed in the VH (per person/plate)
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold">₹150/-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Cancellation Charges */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-primary mb-4 border-b-2 border-secondary pb-2">
              VI. Cancellation Charges
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">Condition</th>
                    <th className="border border-gray-300 px-4 py-2">Cancellation Charges</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Cancellation notice is more than 7 days in advance from the date of arrival
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-green-600 font-semibold">Nil</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Cancellations within 7 days before the date of arrival
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-semibold">25% of one day room rent</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Cancellation of booking on the day of arrival or non turn-up of the guest
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-red-600 font-semibold">
                      50% of one day room rent
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Responsibilities */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-primary mb-4 border-b-2 border-secondary pb-2">
              VII. Responsibilities of Indenter/Forwarding Official
            </h2>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                All the facilities in VH are necessarily for official purposes only. The indenters are advised not to book 
                rooms for personal purposes of the visitors/unknown visitors in view of the resource crunch as well as 
                security hazards. By filling up the requisition form for allotment of the VH facilities, the indenter/
                forwarding official/visitor shall be treated to have accepted to abide by all the terms & conditions stated 
                above and take personal responsibility for the genuineness of the visitor, behavioral issues with the 
                visitors and any damages caused by the visitor during the stay.
              </p>
            </div>
          </section>

          {/* Important Notice */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-8">
            <p className="text-red-800 font-semibold text-sm">
              Important: Check-out is 24 hours from the check-in time. Charges are applicable beyond 24 hours.
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-secondary/10 rounded-lg p-6 mt-8 text-center">
            <h3 className="font-semibold text-slate-primary mb-2">Contact Us</h3>
            <p className="text-gray-700">For bookings and inquiries:</p>
            <p className="text-secondary font-semibold text-lg">vh@iiitdmj.ac.in</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rules;
