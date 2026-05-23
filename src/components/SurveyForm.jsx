import Input from './Input';
import Button from './Button';

const SurveyForm = ({ formData, onChange, onContinue, loading }) => {
  return (
    <div className="survey-form-container">
      <div className="survey-form-fields">
        <div className="survey-form-bg">
          <Input
            label="Surveyor Name"
            name="surveyName"
            value={formData.surveyName}
            onChange={onChange}
            placeholder="John Doe"
          />
          <Input
            label="Surveyor Number"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={onChange}
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="survey-form-action">
          <Button onClick={onContinue} isLoading={loading}>
            Continue
            <svg className="button-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;
