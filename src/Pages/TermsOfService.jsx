import React from "react";
import "./TermsOfService.css";  // Add your styling here
import { useNavigate } from "react-router-dom";
const TermsOfService = () => {
  const navigate = useNavigate();
  return (
    <div className="terms-of-service">
      
      <button onClick={() => navigate(-1)} className="back-btn">← Back</button><h1>Terms of Service</h1>
      
      <p>Effective Date: May 10, 2025</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using <em>Classroom Scheduling System</em>, you agree to comply with and
        be bound by these Terms of Service. If you do not agree to these terms,
        do not use the service.
      </p>

      <h2>2. Use of Service</h2>
      <p>
        You agree to use the service only for lawful purposes and in a manner that does not infringe the 
        rights of, restrict, or inhibit anyone else's use of the service. Prohibited behavior 
        includes but is not limited to harassing, threatening, or otherwise causing distress to 
        other users, or disrupting the normal flow of communication within the system.
      </p>

      <h2>3. Account Responsibility</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account
        and password. You agree to notify us immediately of any unauthorized use
        of your account.
      </p>

      <h2>4. Privacy Policy</h2>
      <p>
        Our use of personal information is governed by our Privacy Policy, which
        is incorporated into these Terms of Service.
      </p>

      <h2>5. Limitation of Liability</h2>
      <p>
      <em>Classroom Scheduling System</em> is not responsible for any damages resulting from
        your use or inability to use the service, including indirect, incidental,
        or consequential damages.
      </p>

      <h2>6. Termination</h2>
      <p>
        We reserve the right to suspend or terminate your access to the service
        for any reason, including a violation of these terms.
      </p>

      <h2>7. Changes to Terms</h2>
      <p>
        We may update these Terms of Service from time to time. Any changes will
        be posted on this page with an updated "Effective Date."
      </p>

      <div className="acceptance">
        <p>
          By using the service, you acknowledge that you have read, understood,
          and agree to these Terms of Service.
        </p>
      </div>
      
    </div>
  );
};

export default TermsOfService;
