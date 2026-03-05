
export const ShortTypeToggle = ({ value, onChange }) => {
  return (
    <div className="d-flex align-items-center gap-3 mt-3">
      <span className={value === "vertical" ? "fw-bold" : "opacity-50"}>
        Vertical
      </span>

      <div className="form-check form-switch m-0">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          checked={value === "horizontal"}
          onChange={(e) =>
            onChange(e.target.checked ? "horizontal" : "vertical")
          }
        />
      </div>

      <span className={value === "horizontal" ? "fw-bold" : "opacity-50"}>
        Horizontal
      </span>
    </div>
  );
};